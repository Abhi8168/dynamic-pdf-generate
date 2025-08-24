import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PdfGenerateLog,
  PdfGenerateLogDocument,
} from './pdf-generate-log.schema';

@Injectable()
export class PdgGenerateLogService {
  constructor(
    @InjectModel(PdfGenerateLog.name)
    private readonly pdgGenerateLogModel: Model<PdfGenerateLogDocument>,
  ) {}
  async createLog(userId, payload, pdfPathUrl) {
    let create = await this.pdgGenerateLogModel.create({
      payload: payload,
      userId: userId,
      pdfUrl: pdfPathUrl,
    });

    return create;
  }

  async fetchLogs(limit, skip) {
    const data = await this.pdgGenerateLogModel
      .find({
        isDeleted: false,
      })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
    const count = await this.pdgGenerateLogModel.countDocuments({
      isDeleted: false,
    });
    return { data, count };
  }
 
}
