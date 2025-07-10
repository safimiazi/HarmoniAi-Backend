
import { Schema, model } from "mongoose";
import { TUser } from "./user.interface";
import { LANGUAGE } from "./user.constants";

const addressSchema = new Schema(
  {
    label: { type: String, required: true }, // e.g., "Home", "Office"
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, required: true },
    countryCode: {
      type: String
    },
    phoneNumber: {
      type: String
    }
  },
);

const userSchema = new Schema<TUser>(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      select: false,
      required: function () {
        return !this.provider;
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: null,
    },
    verificationCodeExpiresAt: {
      type: Date,
      default: null,
    },
    lastVerificationSentAt: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
    token: {
      type: Number,
      required: true,
      default: 100,
      min: 0,
    },
    theme: {
      type: String,
      enum: ["dark", "light", "system"],
      default: "system",
    },
    language: {
      type: String,
      enum: LANGUAGE,
      default: "English",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
    },

    // ✅ New fields below
    region: {
      type: String,
    },
    height: {
      type: Number, // in cm
    },
    size: {
      type: String, // e.g., "M", "L", "XL"
    },
    shoeSize: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    age: {
      type: Number,
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    phoneNumber: {
      type: String,
    },
    identificationNumber: {
      type: String,
    },
    // omuzUsername: {
    //   type: String,
    // },
    // isOmuzVerified: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  {
    timestamps: true,
  }
);

export const User = model<TUser>("User", userSchema);




































// import { Schema, model } from "mongoose";
// import { TUser } from "./user.interface";
// import { LANGUAGE } from "./user.constants";

// const userSchema = new Schema<TUser>(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     image: {
//       type: String,
//       default: null,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     password: {
//       type: String,
//       select: false,
//       required: function () {
//         return !this.provider;
//       },
//     },
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//     verificationCode: {
//       type: String,
//       default: null,
//     },
//     verificationCodeExpiresAt: {
//       type: Date,
//       default: null,
//     },
//     lastVerificationSentAt: {
//       type: Date,
//       default: null,
//     },
//     role: {
//       type: String,
//       required: true,
//       enum: ["user", "admin"],
//       default: "user",
//     },
//     token: {
//       type: Number,
//       required: true,
//       default: 100,
//       min: 0,
//     },
//     theme: {
//       type: String,
//       enum: ["dark", "light", "system"],
//       default: "system",
//     },
//     language: {
//       type: String,
//       enum: LANGUAGE,
//       default: "English",
//     },
//     isDeleted: {
//       type: Boolean,
//       default: false,
//     },
//     provider: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const User = model<TUser>("User", userSchema);
