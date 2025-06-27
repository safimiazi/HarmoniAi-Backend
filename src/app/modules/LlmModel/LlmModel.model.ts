import { Schema, model, Types, Document } from 'mongoose';

export interface ILlmModel extends Document {
  title: string;
  name: string;
  thumbnail_url?: string;
  inputTokenPrice: number;
  outputTokenPrice: number;
  description?: string;
  provider: Types.ObjectId;
  isDeleted?: boolean;
}

const llmModelSchema = new Schema<ILlmModel>(
  {
    title: { type: String, required: true },
    name: { type: String, required: true },
    thumbnail_url: String,
    inputTokenPrice: { type: Number, required: true },
    outputTokenPrice: { type: Number, required: true },
    description: String,
    provider: { type: Schema.Types.ObjectId, ref: 'LlmProvider', required: true },
    isDeleted: { type: Boolean, default: false}
  },
  { timestamps: true }
);

export default model<ILlmModel>('LlmModel', llmModelSchema);
