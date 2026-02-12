import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
const pdfParse = require('pdf-parse');
import * as mammoth from 'mammoth';

@Injectable()
export class DocumentExtractionService {
  private readonly logger = new Logger(DocumentExtractionService.name);
  private readonly CHUNK_SIZE = 2048;

  /**
   * Extract text from a document based on its mimetype
   */
  async extractText(filePath: string, mimetype: string): Promise<string> {
    this.logger.log(`Extracting text from file: ${filePath} (${mimetype})`);
    
    try {
      switch (mimetype) {
        case 'application/pdf':
          return await this.extractTextFromPDF(filePath);
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractTextFromDOCX(filePath);
        case 'text/plain':
          return await this.extractTextFromTXT(filePath);
        default:
          throw new Error(`Unsupported file type: ${mimetype}`);
      }
    } catch (error) {
      this.logger.error(`Failed to extract text from ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Extract text from PDF file
   */
  private async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text.trim();
    } catch (error) {
      this.logger.error(`PDF extraction error:`, error.message);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Extract text from DOCX file
   */
  private async extractTextFromDOCX(filePath: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      
      if (result.messages && result.messages.length > 0) {
        this.logger.warn(`DOCX extraction warnings:`, result.messages);
      }
      
      return result.value.trim();
    } catch (error) {
      this.logger.error(`DOCX extraction error:`, error.message);
      throw new Error(`Failed to extract text from DOCX: ${error.message}`);
    }
  }

  /**
   * Extract text from plain text file
   */
  private async extractTextFromTXT(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content.trim();
    } catch (error) {
      this.logger.error(`TXT extraction error:`, error.message);
      throw new Error(`Failed to read text file: ${error.message}`);
    }
  }

  /**
   * Split text into chunks of specified size (default 2048 characters)
   * Tries to split on sentence boundaries when possible
   */
  splitTextIntoChunks(text: string, chunkSize: number = this.CHUNK_SIZE): string[] {
    if (!text || text.length === 0) {
      return [];
    }

    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      let endIndex = startIndex + chunkSize;
      
      // If this is not the last chunk, try to find a sentence boundary
      if (endIndex < text.length) {
        // Look for sentence endings (., !, ?) followed by space
        const chunk = text.substring(startIndex, endIndex + 100); // Look ahead a bit
        const sentenceEnd = chunk.search(/[.!?]\s/);
        
        if (sentenceEnd !== -1 && sentenceEnd < chunkSize) {
          endIndex = startIndex + sentenceEnd + 1;
        } else {
          // If no sentence boundary found, try to break at word boundary
          const remainingText = text.substring(startIndex, endIndex);
          const lastSpaceIndex = remainingText.lastIndexOf(' ');
          
          if (lastSpaceIndex > chunkSize * 0.8) { // Only if we're at least 80% into the chunk
            endIndex = startIndex + lastSpaceIndex;
          }
        }
      } else {
        endIndex = text.length;
      }

      const chunk = text.substring(startIndex, endIndex).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      startIndex = endIndex;
    }

    this.logger.log(`Split text into ${chunks.length} chunks`);
    return chunks;
  }

  /**
   * Extract text and split into chunks in one operation
   */
  async extractAndChunk(filePath: string, mimetype: string): Promise<{
    text: string;
    chunks: string[];
  }> {
    const text = await this.extractText(filePath, mimetype);
    const chunks = this.splitTextIntoChunks(text);
    
    return {
      text,
      chunks,
    };
  }
}
