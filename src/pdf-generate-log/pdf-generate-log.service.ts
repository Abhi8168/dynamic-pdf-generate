import { Injectable, NotFoundException } from '@nestjs/common';
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

  async updateLog(id, userId, payload, pdfPathUrl) {
    return await this.pdgGenerateLogModel.findOneAndUpdate(
      {
        _id: id,
        userId: userId,
      },
      {
        $set: {
          pdfUrl: pdfPathUrl,
          payload: payload,
        },
      },
      {
        new: true,
      },
    );
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

  async getById(id, userDetail) {
    const data = await this.pdgGenerateLogModel.findOne({
      _id: id,
      userId: userDetail._id,
    });
    if (!data) {
      throw new NotFoundException({
        success: false,
        message: 'Log not found',
      });
    }
    return data;
  }
}
