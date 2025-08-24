import { Module } from '@nestjs/common';
import { PdgGenerateLogController } from './pdf-generate-log.controller';
import { PdgGenerateLogService } from './pdf-generate-log.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PdfGenerateLog,
  PdfGenerateLogSchema,
} from './pdf-generate-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: PdfGenerateLog.name,
      schema: PdfGenerateLogSchema,
    }]),

  ],
  controllers: [PdgGenerateLogController],
  providers: [PdgGenerateLogService],
  exports: [PdgGenerateLogService],
})
export class PdgGenerateLogModule {}
