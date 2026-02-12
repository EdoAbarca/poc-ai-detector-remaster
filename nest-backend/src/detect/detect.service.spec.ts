import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DetectService } from './detect.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DetectService', () => {
  let service: DetectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetectService],
    }).compile();

    service = module.get<DetectService>(DetectService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('detectWithFastDetectGPT', () => {
    it('should successfully detect AI-generated text', async () => {
      const createDetectDto = {
        text: 'This is a sample AI-generated text.',
      };

      const mockResponse = {
        data: {
          ai_score: 85.5,
          ai_result: 'AI' as const,
          criterion: 1.2,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.detectWithFastDetectGPT(createDetectDto);

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/fast-detect-gpt/detect'),
        { text: createDetectDto.text },
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        }),
      );
    });

    it('should successfully detect human-written text', async () => {
      const createDetectDto = {
        text: 'This is a sample human-written text.',
      };

      const mockResponse = {
        data: {
          ai_score: 15.0,
          ai_result: 'Human' as const,
          criterion: -0.8,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.detectWithFastDetectGPT(createDetectDto);

      expect(result).toEqual(mockResponse.data);
      expect(result.ai_result).toBe('Human');
    });

    it('should throw SERVICE_UNAVAILABLE when connection is refused', async () => {
      const createDetectDto = {
        text: 'Test text',
      };

      const error: any = new Error('Connection refused');
      error.code = 'ECONNREFUSED';
      error.isAxiosError = true;
      mockedAxios.isAxiosError.mockReturnValue(true);
      mockedAxios.post.mockRejectedValue(error);

      await expect(service.detectWithFastDetectGPT(createDetectDto)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.detectWithFastDetectGPT(createDetectDto);
      } catch (e) {
        expect(e.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        expect(e.message).toContain('Fast-Detect-GPT service is not available');
      }
    });

    it('should throw error from Fast-Detect-GPT service response', async () => {
      const createDetectDto = {
        text: 'Test text',
      };

      const error: any = new Error('Service error');
      error.isAxiosError = true;
      error.response = {
        status: 400,
        data: {
          error: 'Invalid text format',
        },
      };
      mockedAxios.isAxiosError.mockReturnValue(true);
      mockedAxios.post.mockRejectedValue(error);

      await expect(service.detectWithFastDetectGPT(createDetectDto)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.detectWithFastDetectGPT(createDetectDto);
      } catch (e) {
        expect(e.getStatus()).toBe(400);
      }
    });

    it('should throw INTERNAL_SERVER_ERROR for unknown errors', async () => {
      const createDetectDto = {
        text: 'Test text',
      };

      const error = new Error('Unknown error');
      mockedAxios.isAxiosError.mockReturnValue(false);
      mockedAxios.post.mockRejectedValue(error);

      await expect(service.detectWithFastDetectGPT(createDetectDto)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.detectWithFastDetectGPT(createDetectDto);
      } catch (e) {
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(e.message).toContain('Failed to analyze text');
      }
    });
  });
});
