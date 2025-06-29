import { Schema, model } from "mongoose";
import { TConversation, TMessage } from "./conversation.interface";
import { string } from "zod";

const CardSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
      default: "image",
    },
    image: {
      type: String,
      require: false,
      default: null
    },
    file: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

// Prompt schema
const PromptSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["text", "audio", "video", "image", "document"],
      required: true,
      default: "text",
    },
    content: { type: String, required: true },
  },
  { _id: false }
);

// Response schema
const ResponseSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["text", "audio", "video", "image", "document", "card"],
      required: true,
      default: "text",
    },
    isCard: { type: Boolean, default: false },
    content: { type: String },
    cardContent: [CardSchema],
  },
  { _id: false }
);

// Message schema
const MessageSchema = new Schema<TMessage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    model: {
      type: new Schema(
        {
          prompt: { type: String },
          title: { type: String },
          name: { type: String },
          thumbnail_url: { type: String },
          price: { type: Number },
          intend: { type: String },
        },
        { _id: false } // 👉 এতে করে nested subdocument এ আলাদা _id তৈরি হবে না
      ),
      default: null, // 👉 Default null if not provided
    },
    modelInfo: {
      type: Schema.Types.Mixed, // 👉 Allows any kind of object
      default: null,
    },
    intend: String,
    runtime: Number,
    price: { type: Number, required: true, min: 0 },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    prompt: { type: [PromptSchema], required: true },
    enhancedPrompt: String,
    response: { type: [ResponseSchema], required: true },
  },
  { timestamps: true }
);

const ConversationSchema = new Schema<TConversation>(
  {
    platform: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Message = model("Message", MessageSchema);
export const Conversation = model("Conversation", ConversationSchema);
