import { Test, TestingModule } from '@nestjs/testing';
import { DocumentExtractionService } from './document-extraction.service';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('DocumentExtractionService', () => {
  let service: DocumentExtractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentExtractionService],
    }).compile();

    service = module.get<DocumentExtractionService>(DocumentExtractionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('splitTextIntoChunks', () => {
    it('should split text into chunks of specified size', () => {
      const text = 'A'.repeat(5000);
      const chunks = service.splitTextIntoChunks(text, 2048);

      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach((chunk, index) => {
        if (index < chunks.length - 1) {
          expect(chunk.length).toBeLessThanOrEqual(2048);
        }
      });
    });

    it('should return empty array for empty text', () => {
      const chunks = service.splitTextIntoChunks('');
      expect(chunks).toEqual([]);
    });

    it('should return single chunk for small text', () => {
      const text = 'This is a small text.';
      const chunks = service.splitTextIntoChunks(text);
      
      expect(chunks.length).toBe(1);
      expect(chunks[0]).toBe(text);
    });

    it('should try to split on sentence boundaries', () => {
      const text = 'A'.repeat(2000) + '. ' + 'B'.repeat(2000);
      const chunks = service.splitTextIntoChunks(text, 2048);

      expect(chunks.length).toBe(2);
      // First chunk should end near the sentence boundary
      expect(chunks[0]).toContain('A');
      expect(chunks[1]).toContain('B');
    });

    it('should handle text with no sentence boundaries', () => {
      const text = 'A'.repeat(5000);
      const chunks = service.splitTextIntoChunks(text, 2048);

      expect(chunks.length).toBeGreaterThan(1);
      // Should still split the text
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      expect(totalLength).toBe(text.length);
    });
  });

  describe('extractText', () => {
    it('should throw error for unsupported file type', async () => {
      await expect(
        service.extractText('/fake/path.xyz', 'application/xyz'),
      ).rejects.toThrow('Unsupported file type');
    });

    it('should handle PDF extraction errors gracefully', async () => {
      await expect(
        service.extractText('/nonexistent/file.pdf', 'application/pdf'),
      ).rejects.toThrow();
    });

    it('should handle DOCX extraction errors gracefully', async () => {
      await expect(
        service.extractText(
          '/nonexistent/file.docx',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ),
      ).rejects.toThrow();
    });
  });

  describe('extractAndChunk', () => {
    it('should extract and chunk text in one operation', async () => {
      // Create a temporary test file
      const testDir = path.join(__dirname, '../../test-files-temp');
      const testFile = path.join(testDir, 'test.txt');
      const testContent = 'A'.repeat(3000);

      try {
        // Create test directory and file
        await fs.mkdir(testDir, { recursive: true });
        await fs.writeFile(testFile, testContent);

        const result = await service.extractAndChunk(testFile, 'text/plain');

        expect(result.text).toBe(testContent);
        expect(result.chunks.length).toBeGreaterThan(1);
        
        // Clean up
        await fs.unlink(testFile);
        await fs.rmdir(testDir, { recursive: true });
      } catch (error) {
        // Clean up in case of error
        try {
          await fs.unlink(testFile);
          await fs.rmdir(testDir, { recursive: true });
        } catch (e) {
          // Ignore cleanup errors
        }
        throw error;
      }
    });
  });
});
