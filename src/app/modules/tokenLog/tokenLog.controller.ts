import { Request, Response } from "express";
import { tokenLogService } from "./tokenLog.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";



const getAllTokenLog = catchAsync(async (req: Request, res: Response) => {
  const result = await tokenLogService.getAllTokenLogFromDB(req.query);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
});
const UserGetHerTokenLog = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.loggedInUser;

  const result = await tokenLogService.UserGetHerTokenLogFromDB(req.query , userId);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
});

const getSingleTokenLog = catchAsync(async (req: Request, res: Response) => {
  const result = await tokenLogService.getSingleTokenLogFromDB(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
});


const deleteTokenLog = catchAsync(async (req: Request, res: Response) => {
  await tokenLogService.deleteTokenLogFromDB(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Deleted successfully", data: null });
});


export const tokenLogController = { getAllTokenLog, getSingleTokenLog, deleteTokenLog,UserGetHerTokenLog};
