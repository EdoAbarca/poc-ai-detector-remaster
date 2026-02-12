import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { CreateDetectDto } from './dto/create-detect.dto';

export interface FastDetectGPTResponse {
  ai_score: number;
  ai_result: 'AI' | 'Human';
  criterion: number;
}

@Injectable()
export class DetectService {
  private readonly logger = new Logger(DetectService.name);
  private readonly fastDetectGptUrl = process.env.FAST_DETECT_GPT_URL || 'http://localhost:8001';

  async detectWithFastDetectGPT(createDetectDto: CreateDetectDto): Promise<FastDetectGPTResponse> {
    const { text } = createDetectDto;

    try {
      this.logger.log(`Calling Fast-Detect-GPT service for text analysis (${text.length} characters)`);

      const response = await axios.post<FastDetectGPTResponse>(
        `${this.fastDetectGptUrl}/fast-detect-gpt/detect`,
        { text },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minute timeout (model loading can take time)
        },
      );

      this.logger.log(
        `Fast-Detect-GPT analysis complete: ${response.data.ai_result} (score: ${response.data.ai_score})`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Fast-Detect-GPT service error: ${error.message}`, error.stack);

      if (error.isAxiosError) {
        const axiosError = error as AxiosError;
        if (axiosError.code === 'ECONNREFUSED') {
          throw new HttpException(
            'Fast-Detect-GPT service is not available',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        if (axiosError.response) {
          const errorData = axiosError.response.data as any;
          throw new HttpException(
            errorData?.error || 'Fast-Detect-GPT service error',
            axiosError.response.status,
          );
        }
      }

      throw new HttpException(
        'Failed to analyze text with Fast-Detect-GPT',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
