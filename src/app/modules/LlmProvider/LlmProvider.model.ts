import { Schema, model, Types, Document } from 'mongoose';

export interface ILlmProvider extends Document {
    name: string;
    isDeleted?: boolean;
    models: Types.ObjectId[];
}

const llmProviderSchema = new Schema<ILlmProvider>(
    {
        name: { type: String, required: true, unique: true },
        isDeleted: { type: Boolean, default: false },
        models: [{ type: Types.ObjectId, ref: 'LlmModel' }],
    },
    { timestamps: true }
);

export default model<ILlmProvider>('LlmProvider', llmProviderSchema);
