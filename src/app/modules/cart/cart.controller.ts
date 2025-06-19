import { Request, Response } from "express";
import { cartService } from "./cart.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { User } from "../user/user.model";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const postCart = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.loggedInUser;
  const result = await cartService.postCartIntoDB({ ...req.body, userId });
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Created successfully",
    data: result,
  });
});

const getAllCart = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.loggedInUser;

  const result = await cartService.getAllCartFromDB(req.query, userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Fetched successfully",
    data: result,
  });
});
const adminGetAllUserCart = catchAsync(async (req: Request, res: Response) => {

  const result = await cartService.adminGetAllUserCartFromDB(req.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Fetched successfully",
    data: result,
  });
});

const getSingleCart = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.loggedInUser;

  const result = await cartService.getSingleCartFromDB(req.params.id, userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Fetched successfully",
    data: result,
  });
});

const updateCart = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.loggedInUser;
  const { id } = req.params;
  const result = await cartService.updateCartIntoDB(req.body, id, userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Quantity updated successfully",
    data: result,
  });
});

const deleteCart = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.loggedInUser;
  await cartService.deleteCartFromDB(req.params.id, userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Deleted successfully",
    data: null,
  });
});

const getAddress = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.loggedInUser;
  const user = await User.findById(userId).select('addresses');

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found.")
  }

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Address get successfully",
    data: user?.addresses || [],
  });
});

const postAddress = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.loggedInUser;

  const user = await User.findById(userId).select('addresses');

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found.")
  }
  const addAddress = await User.findByIdAndUpdate(
    userId,
    { $push: { addresses: req.body } },
    { new: true }
  ).select('addresses');

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Address added successfully",
    data: addAddress?.addresses,
  });
});


const updateAddress = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.loggedInUser;
  const addressId = req.params.id

  const user = await User.findById(userId).select('addresses');

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found.")
  }

  // find the address by its _id:
  const address = (user.addresses as any).id(addressId)
  Object.assign(address, req.body);
  await user.save();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Address updated successfully",
    data: null,
  });
});

export const cartController = {
  postCart,
  getAllCart,
  adminGetAllUserCart,
  getSingleCart,
  updateCart,
  deleteCart,
  getAddress,
  postAddress,
  updateAddress
};
