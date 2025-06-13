import express, { Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import globalErrorHandler from "./app/middleWear/globalErrorHandler";
import notFound from "./app/middleWear/notFound";
import cookieParser from "cookie-parser";
import "./app/middleWear/passport";
import passport from "passport";
import { User } from "./app/modules/user/user.model";
import bcrypt from "bcrypt";
import config from "./app/config";
import { configureModel } from "./app/modules/configure/configure.model";
import { handleStripeWebhook } from "./app/modules/subscription/subscription.controller";
import "./app/utils/dailyTokenReset"; // Importing the daily token reset utility to ensure it's executed
const app = express();


app.post(
  "/api/v1/subscriptions/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// Middlewares
app.use(cors({
  origin: "*", // or your frontend domain
  credentials: true, // very important for cookies
})); 

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello harmonia!");
});

export const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: config.default_admin_email });

    if (!existingAdmin) {


      const rawPassword = config.default_admin_password;

      if (!rawPassword) {
        throw new Error("❌ DEFAULT_ADMIN_PASSWORD is not set in environment variables.");
      }
      const hashedPassword = await bcrypt.hash(
        rawPassword.toString(),
        Number(config.bcrypt_salt_rounds)
      );

      await User.create({
        name: config.default_admin_name,
        email: config.default_admin_email,
        password: hashedPassword,
        isVerified: true,
        role: "admin",
        token: 0,
      });

      console.log("✅ Default admin created");
    } else {
      console.log("ℹ️ Admin already exists");
    }
  } catch (error) {
    console.error("❌ Error creating default admin:", error);
  }
};

createDefaultAdmin();

const postConfigureIntoDB = async () => {
  try {
    const count = await configureModel.countDocuments();
    if (count > 0) {
      console.log("ℹ️ Configuration already exists in the database.");
    } else {
      return await configureModel.create({
        dollerPerToken: 5,
        dailyTokenLimit: 100

      });
    }
  } catch (error: unknown) {
    throw error;
  }
}

postConfigureIntoDB()

app.use(notFound);
app.use(globalErrorHandler);

export default app;
