import { z } from "zod";
import { LANGUAGE } from "./user.constants";

const createUserValidationSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().max(20),
    name: z.string(),
  }),
});

const changeLanguageValidationSchema = z.object({
  body: z.object({
    language: z.enum([...LANGUAGE] as [string, ...string[]]),
  }),
});

const changeThemeValidationSchema = z.object({
  body: z.object({
    theme: z.enum(["light", "dark", "system"]),
  }),
});
const deleteUserValidationSchema = z.object({
  body: z.object({
    deleted: z.boolean(),
  }),
});

export const addressValidationSchema = z.object({
  body: z.object({
    label: z.string().min(1, "Label is required"), // e.g., "Home", "Office"
    addressLine1: z.string().min(1, "Address Line 1 is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().min(1, "Country is required"),
  }),
});



export const UserValidations = {
  createUserValidationSchema,
  changeLanguageValidationSchema,
  changeThemeValidationSchema,
  deleteUserValidationSchema,
  addressValidationSchema
};
