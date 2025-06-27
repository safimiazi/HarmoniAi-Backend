import { generateVerificationCode, updateUserProfileService, UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { User } from "./user.model";
import ApiError from "../../errors/ApiError";
import config from "../../config";
import { createToken } from "../auth/auth.utils";
import { sendVerificationEmail } from "../../utils/sendVerificationEmail";
import { subscriptionModel } from "../subscription/subscription.model";
import type { Request, Response } from "express";

export const getDashboardStats = async (req: Request, res: Response) => {
  const [userCount, verifiedUserCount, unverifiedUserCount] = await Promise.all([
    User.countDocuments({ isDeleted: false, role: { $ne: "admin" } }),
    User.countDocuments({ isDeleted: false, role: { $ne: "admin" }, isVerified: true }),
    User.countDocuments({ isDeleted: false, role: { $ne: "admin" }, isVerified: false }),
  ]);

  const [recurringActiveCount, oneTimeActiveCount, totalActiveSubscriptions] = await Promise.all([
    subscriptionModel.countDocuments({ status: 'active', isRecurring: true }),
    subscriptionModel.countDocuments({ status: 'active', isRecurring: false }),
    subscriptionModel.countDocuments({ status: 'active' }),
  ]);

  const [recurringReveneueAgg, oneTimeRevenueAgg] = await Promise.all([
    subscriptionModel.aggregate([
      { $match: { status: 'active', isRecurring: true } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } },
    ]),
    subscriptionModel.aggregate([
      { $match: { status: 'active', isRecurring: false } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } },
    ]),
  ]);

  const recurringRevenue = recurringReveneueAgg[0]?.total || 0;
  const oneTimeRevenue = oneTimeRevenueAgg[0]?.total || 0;
  const totalRevenue = recurringRevenue + oneTimeRevenue;

  // ✅ New: Count subscriptions per pricing plan
  const subscriptionsPerPlan = await subscriptionModel.aggregate([
    {
      $match: { status: "active" },
    },
    {
      $group: {
        _id: "$pricingPlanId",
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "pricings", // collection name (lowercase model)
        localField: "_id",
        foreignField: "_id",
        as: "planInfo",
      },
    },
    {
      $unwind: "$planInfo",
    },
    {
      $project: {
        planId: "$_id",
        planName: "$planInfo.name",
        usedCase: "$planInfo.usedCase",
        count: 1,
        _id: 0,
      },
    },
  ]);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard stats fetched",
    data: {
      userCount,
      verifiedUserCount,
      unverifiedUserCount,
      subscriptionCount: {
        total: totalActiveSubscriptions,
        recurring: recurringActiveCount,
        oneTime: oneTimeActiveCount,
      },
      revenue: {
        total: totalRevenue,
        recurring: recurringRevenue,
        oneTime: oneTimeRevenue,
      },
      subscriptionsPerPlan, // ✅ new field (array of objects)
    },
  });
};


const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users retrieved successfully.",
    data: result,
  });
});
const updateUserProfile = catchAsync(async (req, res) => {
  const userId = req.loggedInUser.userId;


  // ✅ Allowed fields to update
  const allowedFields = [
    "name",
    "region",
    "language",
    "gender",
    "age",
    "height",
    "size",
    "shoeSize",
    "photo",
    "omuzUsername",
    "phoneNumber",
    "identificationNumber",
    "theme"
  ];

  // 🔒 Filter only allowed fields
  const updatePayload: Partial<any> = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) {
      updatePayload[key] = req.body[key];
    }
  }

  const updatedUser = await updateUserProfileService(userId, updatePayload);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});
const adminUpdateUserProfile = catchAsync(async (req, res) => {
  const userId = req.params.id;


  // ✅ Allowed fields to update
  const allowedFields = [
    "name",
    "image",
    "region",
    "language",
    "gender",
    "age",
    "height",
    "size",
    "shoeSize",
    "photo",
    "omuzUsername",
    "phoneNumber",
    "identificationNumber",
    "theme"
  ];

  // 🔒 Filter only allowed fields
  const updatePayload: Partial<any> = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) {
      updatePayload[key] = req.body[key];
    }
  }

  const updatedUser = await updateUserProfileService(userId, updatePayload);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});




const getMe = catchAsync(async (req, res) => {
  const result = await UserServices.getMeFromDB(req.loggedInUser);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Authenticated user information retrieved successfully.",
    data: result,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const result = await UserServices.getSingleUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User information retrieved successfully.",
    data: result,
  });
});



const createAUser = catchAsync(async (req, res) => {

  const result = await UserServices.createAUserIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User created successfully. Please check your email for verification.",
    data: result,
  });
});

const uploadImage = catchAsync(async (req, res) => {
  const result = await UserServices.uploadImageIntoDB(
    req.loggedInUser,
    req.file
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile image updated successfully.",
    data: result,
  });
});

const changeUserLanguage = catchAsync(async (req, res) => {
  const result = await UserServices.changeUserLanguage(
    req.loggedInUser,
    req.body.language
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Preferred language updated successfully.",
    data: result,
  });
});

const changeUserTheme = catchAsync(async (req, res) => {
  const result = await UserServices.changeUserTheme(
    req.loggedInUser,
    req.body.theme
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Theme preference updated successfully.",
    data: result,
  });
});

const toggleUserDelete = catchAsync(async (req, res) => {
  const result = await UserServices.toggleUserDeleteInDB(
    req.params.id,
    req.body.deleted
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: req.body.deleted
      ? "User marked as deleted successfully."
      : "User restored successfully.",
    data: result,
  });
});



const verifyOTP = catchAsync(async (req, res) => {
  const { email, code } = req.body;

  const user: any = await User.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found or code expired.");
  }

  if (user.isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is already verified.");
  }

  if (!user.verificationCode || !user.verificationCodeExpiresAt) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No active verification code found.");
  }

  const isCodeMatched = parseInt(user.verificationCode) === parseInt(code);
  const isCodeExpired = new Date() > new Date(user.verificationCodeExpiresAt);

  if (!isCodeMatched) {
    throw new ApiError(httpStatus.FORBIDDEN, "Invalid verification code.");
  }

  if (isCodeExpired) {
    throw new ApiError(httpStatus.FORBIDDEN, "Verification code has expired.");
  }

  user.isVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpiresAt = null;
  await user.save();

  const jwtPayload = { userId: user._id.toString(), role: user.role };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret!,
    parseInt(config.jwt_access_expires_in!)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Email verified successfully.",
    data: { accessToken },
  });
});




const resendVerificationCode = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
  }

  if (user.isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User is already verified.");
  }

  const now = new Date();
  const lastSent = user.lastVerificationSentAt || new Date(0);
  const cooldownEnds = new Date(lastSent.getTime() + 10 * 60 * 1000);

  if (now < cooldownEnds) {
    const minutesLeft = Math.ceil((cooldownEnds.getTime() - now.getTime()) / 60000);
    throw new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      `Please wait ${minutesLeft} more minute(s) before requesting a new code.`
    );
  }

  const newCode = generateVerificationCode();
  user.verificationCode = newCode;
  user.verificationCodeExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 mins expiry
  user.lastVerificationSentAt = now;

  await user.save();

  await sendVerificationEmail(user.email, newCode);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "A new verification code has been sent to your email.",
    data: null,
  });
});


const deleteAddress = catchAsync(async (req, res) => {
  const { userId } = req.loggedInUser;
  const addressId = req.params.id

  const user = await User.findById(userId).select('addresses');

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found.")
  }

  // find the address by its _id:
  const address = (user.addresses as any).id(addressId)

  if (!address) {
    throw new ApiError(httpStatus.NOT_FOUND, "address not found")
  }
  address.remove();
  await user.save()

  await user.save();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Address deleted successfully",
    data: null,
  });
});

export const UserControllers = {
  verifyOTP,
  deleteAddress,
  updateUserProfile,
  adminUpdateUserProfile,
  getSingleUser,
  getMe,
  resendVerificationCode,
  getAllUsers,
  createAUser,
  changeUserLanguage,
  changeUserTheme,
  uploadImage,
  toggleUserDelete,
};
