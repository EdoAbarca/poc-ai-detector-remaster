import { Module, forwardRef } from '@nestjs/common';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';
import { DocumentExtractionService } from './document-extraction.service';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [PrismaModule, forwardRef(() => QueueModule)],
  controllers: [ScanController],
  providers: [ScanService, DocumentExtractionService],
  exports: [ScanService, DocumentExtractionService],
})
export class ScanModule {}
