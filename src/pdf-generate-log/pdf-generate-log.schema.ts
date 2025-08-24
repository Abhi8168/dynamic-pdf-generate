import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/user/user.schema';

@Schema({ timestamps: true })
export class PdfGenerateLog {
  @Prop({ type: Object, required: true })
  payload: Record<string, any>;

  @Prop({ type: String, required: true })
  pdfUrl: string;

  @Prop({ required: false, default: false, type: Boolean })
  isDeleted: boolean;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  userId: mongoose.Types.ObjectId;
}

export type PdfGenerateLogDocument = PdfGenerateLog & Document;
export const PdfGenerateLogSchema=SchemaFactory.createForClass(PdfGenerateLog);
