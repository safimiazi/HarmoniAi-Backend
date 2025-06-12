import { z } from "zod";

const createConversationNameValidationSchema = z.object({
  body: z.object({
    platform: z.string(),
  }),
});
const updateConversationNameValidationSchema = z.object({
  body: z.object({
    name: z.string(),
  }),
});

export const ConversationValidations = {
  updateConversationNameValidationSchema,
  createConversationNameValidationSchema
};
