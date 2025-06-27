import { Request, Response } from "express";
import { LlmProviderService } from "./LlmProvider.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";

const postLlmProvider = catchAsync(async (req: Request, res: Response) => {
  const result = await LlmProviderService.postLlmProviderIntoDB(req.body);
  sendResponse(res, { statusCode: status.CREATED, success: true, message: "Created successfully", data: result });
});

const getAllLlmProvider = catchAsync(async (req: Request, res: Response) => {
  const result = await LlmProviderService.getAllLlmProviderFromDB(req.query);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
});

const getSingleLlmProvider = catchAsync(async (req: Request, res: Response) => {
  const result = await LlmProviderService.getSingleLlmProviderFromDB(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
});

const updateLlmProvider = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  req.body.id = id;
  const result = await LlmProviderService.updateLlmProviderIntoDB(req.body);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Updated successfully", data: result });
});

const deleteLlmProvider = catchAsync(async (req: Request, res: Response) => {
  await LlmProviderService.deleteLlmProviderFromDB(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Deleted successfully", data: null });
});


export const LlmProviderController = { postLlmProvider, getAllLlmProvider, getSingleLlmProvider, updateLlmProvider, deleteLlmProvider };
