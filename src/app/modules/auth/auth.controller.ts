import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import config from "../../config";
import { createToken } from "./auth.utils";

const loginUser = catchAsync(async (req, res) => {

  const result = await AuthServices.loginUser(req.body);
  const { refreshToken, ...data } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: config.node_env === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: data,
  });
});

const googleCallback = catchAsync(async (req, res) => {
  const user = req.user as any;

  const jwtPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret!,
    parseInt(config.jwt_access_expires_in!)
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret!,
    parseInt(config.jwt_refresh_expires_in!)
  );

  res.cookie("refreshToken", refreshToken, {
    secure: config.node_env === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });


  res.redirect(`${config.CLIENT_URL}/auth/google/callback?token=${accessToken}`);


  // sendResponse(res, {
  //   statusCode: httpStatus.OK,
  //   success: true,
  //   message: "Login successful",
  //   data: { accessToken },
  // });



});

const changePassword = catchAsync(async (req, res) => {
  const result = await AuthServices.changePassword(req.loggedInUser, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password is updated successfully",
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthServices.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token is refreshed successfully!",
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.forgetPassword(req.body.email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reset link is sent to client's mail successfully!",
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization as string;
  const result = await AuthServices.resetPassword(req.body, token);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password has been reset successfully!",
    data: result,
  });
});

const logOutUser = catchAsync(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "none",
  });


  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

export const AuthControllers = {
  loginUser,
  googleCallback,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
  logOutUser
};




