import mongoose from "mongoose";
import nodeCron from "node-cron";
import { User } from "../modules/user/user.model";
import { configureModel } from "../modules/configure/configure.model";
import { subscriptionModel } from "../modules/subscription/subscription.model";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";

nodeCron.schedule("0 0 * * *", async () => {
  // console.log("Running daily token reset at midnight");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const config = await configureModel.findOne();
    if (!config) {
      throw new ApiError(httpStatus.NOT_FOUND, "Configuration not found");
    }

    // 1️⃣ Get all userIds with ACTIVE recurring subscriptions
    const recurringUserIds = await subscriptionModel
      .distinct("userId", { isRecurring: true, status: "active" })
      .session(session);

    // 2️⃣ Reset tokens for users NOT in that list
    const result = await User.updateMany(
      {
        _id: { $nin: recurringUserIds },
        token: { $lt: config.dailyTokenLimit },
      },
      {
        $set: { token: config.dailyTokenLimit },
      },
      { session }
    );

    await session.commitTransaction();
    // console.log(`✅ Daily token reset completed for ${result.modifiedCount} users (non-recurring)`);
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ Cron job failed:", error);
  } finally {
    session.endSession();
  }
});
