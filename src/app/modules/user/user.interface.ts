import USER_ROLE from "../../constants/userRole";

export type TLanguage =
  | "Amharic"
  | "Arabic"
  | "Bengali"
  | "Burmese"
  | "Dutch"
  | "English"
  | "French"
  | "German"
  | "Gujarati"
  | "Hausa"
  | "Hindi"
  | "Indonesian"
  | "Italian"
  | "Japanese"
  | "Kannada"
  | "Korean"
  | "Malay"
  | "Malayalam"
  | "Mandarin Chinese"
  | "Marathi"
  | "Odia"
  | "Pashto"
  | "Persian"
  | "Polish"
  | "Portuguese"
  | "Punjabi"
  | "Romanian"
  | "Russian"
  | "Sindhi"
  | "Spanish"
  | "Swahili"
  | "Tamil"
  | "Telugu"
  | "Thai"
  | "Turkish"
  | "Ukrainian"
  | "Urdu"
  | "Vietnamese"
  | "Yoruba";

export type TAddress = {
  label?: string; // Optional (e.g., Home, Office)
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
};

export type TUser = {
  _id?: string;
  name: string;
  image?: string | null;
  email: string;
  password?: string;
  isVerified: boolean;
  verificationCode?: string | null;
  verificationCodeExpiresAt?: Date | null;
  lastVerificationSentAt?: Date | null;
  role: "user" | "admin";
  token: number;
  theme: "dark" | "light" | "system";
  language: string;
  isDeleted: boolean;
  provider?: string;

  // 🆕 Additional Fields
  region?: string;
  addresses?: TAddress[];
  phoneNumber?: string;
  identificationNumber?: string;

  // Personal info
  gender?: "male" | "female" | "other";
  height?: number; // in cm
  size?: string; // clothing size (e.g., S, M, L, XL)
  shoeSize?: string | number;
  age?: number;

  // // Omuz (Turkey-specific)
  // omuzUsername?: string;
  // isOmuzVerified?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
};

export type TUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
