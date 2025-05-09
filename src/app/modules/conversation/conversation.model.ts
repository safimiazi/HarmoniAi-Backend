import { Schema, model } from "mongoose";
import { TConversation, TMessage } from "./conversation.interface";

const CardSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    type: { type: String, enum: ["image", "video"], required: true },
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
    },
    isCard: { type: Boolean, default: false },
    content: { type: String },
    cardContent: { type: [CardSchema], required: false },
  },
  { _id: false }
);

// Message schema
const MessageSchema = new Schema<TMessage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    prompt: { type: [PromptSchema], required: true },
    response: { type: [ResponseSchema], required: true },
  },
  { timestamps: true }
);

const ConversationSchema = new Schema<TConversation>(
  {
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
