import mongoose from "mongoose";
import { IeachalabModel } from "./eachalabModel.interface";

const eachalabModelSchema = new mongoose.Schema<IeachalabModel>({
    id: { type: String, required: true },
    title: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    thumbnail_url: { type: String },
    price: { type: Number, required: true },
    intend: { type: String, required: true },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

export const eachalabModelModel = mongoose.model("eachalabModel", eachalabModelSchema);