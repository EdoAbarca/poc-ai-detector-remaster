# US-011: Upload and Process Documents - Implementation Summary

## Overview
This implementation adds document upload and text extraction functionality to the AI Detection platform, allowing users to upload PDF and DOCX files for AI detection analysis.

## What Was Implemented

### 1. Database Schema Updates
- Added new fields to the `Document` model:
  - `extractedText`: Stores the full extracted text from the document
  - `textChunks`: Array of text chunks split at 2048 characters for Fast Detect GPT
  - `processingStatus`: Tracks document processing state (pending, processing, completed, failed)
  - `processingError`: Stores any error messages if processing fails
  - `updatedAt`: Timestamp for tracking updates

### 2. Document Extraction Service
Created `DocumentExtractionService` with the following features:
- **Text Extraction**: Supports PDF, DOCX, and TXT files
  - PDF extraction using `pdf-parse` library
  - DOCX extraction using `mammoth` library
  - Plain text file reading
- **Smart Chunking**: Splits text into 2048-character chunks
  - Attempts to split on sentence boundaries
  - Falls back to word boundaries if no sentence boundary found
  - Preserves text integrity while meeting chunk size requirements

### 3. Queue Processing
Updated the upload processor to:
- Extract text from uploaded documents asynchronously
- Update processing status throughout the extraction
- Store extracted text and chunks in the database
- Handle errors gracefully with proper error messages
- Provide progress updates (10%, 70%, 90%, 100%)

### 4. API Integration
The existing `POST /api/v1/scan/with-files` endpoint now:
- Accepts file uploads (PDF, DOCX, TXT)
- Creates document records with `pending` status
- Queues processing jobs for background extraction
- Returns immediately with document metadata

### 5. Testing
Added comprehensive test coverage:
- Text extraction from different file types
- Chunking logic validation
- Sentence boundary detection
- Error handling for invalid files
- Integration with the database

## Dependencies Added
```json
{
  "dependencies": {
    "pdf-parse": "^2.4.5",
    "mammoth": "^1.11.0"
  },
  "devDependencies": {
    "@types/pdf-parse": "^1.1.5"
  }
}
```

## How to Use

### 1. Upload a Document
```bash
curl -X POST http://localhost:3333/api/v1/scan/with-files \
  -F "title=My Document Scan" \
  -F "aiProviders=[\"GPT-4\"]" \
  -F "tags=[\"research\"]" \
  -F "documents=@path/to/document.pdf" \
  -H "Content-Type: multipart/form-data"
```

### 2. Response
The API returns the scan with documents in `pending` status:
```json
{
  "id": 1,
  "title": "My Document Scan",
  "documents": [
    {
      "id": 1,
      "originalName": "document.pdf",
      "processingStatus": "pending",
      "extractedText": null,
      "textChunks": []
    }
  ]
}
```

### 3. Background Processing
The document is processed asynchronously:
1. Status changes to `processing`
2. Text is extracted from the file
3. Text is split into 2048-character chunks
4. Status changes to `completed`
5. `extractedText` and `textChunks` are populated

### 4. Check Processing Status
Query the document to see the extraction results:
```sql
SELECT 
  id, 
  "originalName", 
  "processingStatus", 
  LENGTH("extractedText") as text_length, 
  array_length("textChunks", 1) as chunk_count 
FROM "Document" 
WHERE id = 1;
```

## Supported File Formats

### PDF Files
- **MIME Type**: `application/pdf`
- **Extension**: `.pdf`
- **Max Size**: 10MB
- **Extraction**: Uses `pdf-parse` to extract text content

### DOCX Files
- **MIME Type**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Extension**: `.docx`
- **Max Size**: 10MB
- **Extraction**: Uses `mammoth` to extract text while preserving formatting

### Plain Text Files
- **MIME Type**: `text/plain`
- **Extension**: `.txt`
- **Max Size**: 10MB
- **Extraction**: Direct UTF-8 file reading

## Error Handling

### Upload Errors
- Invalid file type → 400 Bad Request
- File size exceeds limit → 413 Payload Too Large
- No files provided → 400 Bad Request

### Processing Errors
- Text extraction fails → `processingStatus: "failed"`, `processingError` contains details
- Document record is updated but extraction can be retried

## Queue Monitoring
- Bull Board UI available at: `http://localhost:3333/queues`
- Monitor upload queue progress
- View failed jobs and error details
- Retry failed jobs manually if needed

## Testing

### Run All Tests
```bash
make test-backend
```

### Run Document Extraction Tests
```bash
cd nest-backend
npm test -- document-extraction.service.spec.ts
```

### Run with Coverage
```bash
make test-backend-cov
```

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /api/v1/scan/with-files
       ▼
┌─────────────────┐
│  ScanController │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│   ScanService   │─────▶│   QueueService   │
└────────┬────────┘      └─────────┬────────┘
         │                          │
         ▼                          │ Add job to upload-queue
┌─────────────────┐                │
│  PrismaService  │                │
│  (Create Scan   │                ▼
│   & Documents)  │      ┌──────────────────────┐
└─────────────────┘      │   UploadProcessor    │
                         │   (Background Job)    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────────┐
                         │ DocumentExtractionService│
                         │  - Extract text          │
                         │  - Split into chunks     │
                         └──────────┬───────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   PrismaService      │
                         │   (Update Document   │
                         │    with extracted    │
                         │    text & chunks)    │
                         └──────────────────────┘
```

## Future Enhancements
1. Add support for more file formats (DOC, RTF, ODT)
2. Implement OCR for scanned PDFs
3. Add real-time progress updates via WebSocket
4. Implement chunk-by-chunk AI detection
5. Add document preview functionality
6. Support batch file uploads
7. Add file compression before storage
8. Implement duplicate document detection

## Database Migration
```bash
# Migration was automatically created and applied
pnpm exec prisma migrate dev --name add_document_extraction_fields
```

## Acceptance Criteria Status

✅ Files are uploaded successfully  
✅ Text is extracted from PDF and DOCX files  
✅ Loading indicator shows during processing (via progress updates)  
✅ Error message shown if text extraction fails  
✅ Supported formats: PDF, DOCX (+ TXT as bonus)  
✅ File size limit enforced (10MB per file)  
✅ Use BullMQ to queue file processing jobs  
✅ Use Redis to track upload progress  
✅ Emit progress events via BullMQ job progress  
✅ Jest tests for text extraction from various file formats  

## Related Files
- `/nest-backend/src/scan/document-extraction.service.ts` - Text extraction logic
- `/nest-backend/src/scan/document-extraction.service.spec.ts` - Tests
- `/nest-backend/src/queue/processors/upload.processor.ts` - Background processing
- `/nest-backend/src/scan/scan.service.ts` - Job queueing
- `/nest-backend/prisma/schema.prisma` - Database schema
- `/nest-backend/prisma/migrations/20260212000414_add_document_extraction_fields/` - Migration

## Conclusion
The implementation successfully meets all acceptance criteria and provides a robust foundation for document processing and AI detection analysis. The system handles document uploads asynchronously, provides proper error handling, and stores extracted text in an optimized format for AI detection.
