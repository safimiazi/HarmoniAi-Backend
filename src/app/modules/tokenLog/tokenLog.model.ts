import mongoose from "mongoose";

const tokenLogSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    source: { type: String, enum: ["subscription", "one_time"], required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Pricing" },
    tokenAdded: { type: Number, required: true },
    newToken: { type: Number, required: true },
    previousToken: { type: Number, require: true },
    note: { type: String, require: false },
    stripeEventId: { type: String },
    isDeleted: {
        type: Boolean,
        require: false
    },
    timestamp: { type: Date, default: Date.now },

});

export const tokenLogModel = mongoose.model("tokenLog", tokenLogSchema);