import mongoose from "mongoose";

const configureSchema = new mongoose.Schema({
    dollerPerToken: {
        type: Number,
        required: true,
        min: 0,
    },
    dailyTokenLimit: {
        type: Number,
        required: true,
        min: 0,
    },
  

});

export const configureModel = mongoose.model("configure", configureSchema);