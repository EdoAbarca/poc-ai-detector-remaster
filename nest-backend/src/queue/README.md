# Queue Module - Redis & BullMQ Setup

## Overview

This module implements Redis and BullMQ for handling asynchronous job processing in the AI Detector application. It provides real-time tracking for file uploads and AI detection tasks.

## Features

- **Redis Integration**: Redis container configured in Docker Compose for job queue storage
- **BullMQ Queues**: Two dedicated queues for different job types
  - `upload-queue`: Tracks file upload progress
  - `detection-queue`: Tracks AI detection analysis progress
- **Bull Board Dashboard**: Web UI for monitoring queue status at `/queues`
- **Progress Tracking**: Real-time job progress updates via REST API

## Architecture

```
src/queue/
├── processors/
│   ├── upload.processor.ts       # Handles file upload jobs
│   └── detection.processor.ts    # Handles AI detection jobs
├── queue.module.ts                # Queue module configuration
├── queue.service.ts               # Queue service for job management
└── queue.controller.ts            # REST API endpoints
```

## Configuration

### Redis Connection

The module connects to Redis using environment variables:

```typescript
{
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379', 10)
}
```

For Docker environments, the default `redis://redis:6379` connection is used.

## API Endpoints

### Add Jobs

**POST** `/queue/upload`
```json
{
  "fileId": "file-123",
  "fileName": "document.pdf",
  "fileSize": 1024000,
  "userId": "user-456"
}
```

**POST** `/queue/detection`
```json
{
  "fileId": "file-123",
  "content": "Text content to analyze...",
  "userId": "user-456"
}
```

### Check Progress

**GET** `/queue/upload/:jobId`

Returns:
```json
{
  "percentage": 75,
  "status": "active",
  "message": "Processing..."
}
```

**GET** `/queue/detection/:jobId`

Returns:
```json
{
  "percentage": 100,
  "status": "completed",
  "message": "AI detection completed successfully"
}
```

### Queue Statistics

**GET** `/queue/stats/upload`

Returns:
```json
{
  "waiting": 5,
  "active": 2,
  "completed": 123,
  "failed": 1
}
```

**GET** `/queue/stats/detection`

Returns queue statistics for the detection queue.

## Bull Board Dashboard

Access the queue monitoring dashboard at: **http://localhost:3333/queues**

The dashboard provides:

- Real-time view of all queues
- Job status and progress
- Failed job details
- Retry functionality
- Job data inspection

## Job Lifecycle

### Upload Job Flow

1. Job is added to `upload-queue` with file metadata
2. Processor simulates upload with progress updates (0-100%)
3. Progress can be queried via API
4. On completion, job is automatically removed
5. On failure, job is retained for inspection

### Detection Job Flow

1. Job is added to `detection-queue` with content to analyze
2. Processor runs through detection stages:
   - Preprocessing text (20%)
   - Loading models (40%)
   - Running analysis (60%)
   - Computing scores (80%)
   - Finalizing results (90%)
3. Progress updates sent at each stage
4. Returns detection result with confidence score

## Dependencies

```json
{
  "@nestjs/bullmq": "^11.0.4",
  "@bull-board/nestjs": "^6.16.4",
  "@bull-board/express": "^6.16.4",
  "bullmq": "^5.67.2"
}
```

## Usage in Other Modules

To use the queue service in other modules:

```typescript
import { QueueModule } from './queue/queue.module';
import { QueueService } from './queue/queue.service';

@Module({
  imports: [QueueModule],
  // ...
})
export class MyModule {
  constructor(private queueService: QueueService) {}

  async myMethod() {
    // Add a job
    const job = await this.queueService.addUploadJob({
      fileId: 'file-123',
      fileName: 'test.pdf',
      fileSize: 1024,
      userId: 'user-456'
    });

    // Check progress
    const progress = await this.queueService.getUploadJobProgress(job.jobId);
  }
}
```

## Future Enhancements

- WebSocket support for real-time progress updates
- Job priority levels
- Scheduled/delayed jobs
- Job result persistence
- Rate limiting
- Multi-step job workflows
- Integration with actual file upload service
- Integration with Fast-Detect-GPT service

## Testing

Run the queue module tests:

```bash
npm test -- queue
```

## Monitoring

Monitor queue health:

```bash
# Check Redis connection
docker exec redis redis-cli ping

# View queue statistics
curl http://localhost:3333/queue/stats/upload
curl http://localhost:3333/queue/stats/detection

# Access Bull Board
open http://localhost:3333/queues
```
