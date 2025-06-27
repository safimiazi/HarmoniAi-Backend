import { Request, Response } from "express";
import { LlmModelService } from "./LlmModel.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";

const postLlmModel = catchAsync(async (req: Request, res: Response) => {
  const { file } = req;
  const result = await LlmModelService.postLlmModelIntoDB(req.body, file);
  sendResponse(res, { statusCode: status.CREATED, success: true, message: "Created successfully", data: result });
});

const getAllLlmModel = catchAsync(async (req: Request, res: Response) => {
  const result = await LlmModelService.getAllLlmModelFromDB(req.query);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
});

const getSingleLlmModel = catchAsync(async (req: Request, res: Response) => {
  const result = await LlmModelService.getSingleLlmModelFromDB(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
});

const updateLlmModel = catchAsync(async (req: Request, res: Response) => {
  req.body.id = req.params.id;
    const { file } = req;

  const result = await LlmModelService.updateLlmModelIntoDB(req.body, file);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Updated successfully", data: result });
});

const deleteLlmModel = catchAsync(async (req: Request, res: Response) => {
  await LlmModelService.deleteLlmModelFromDB(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Deleted successfully", data: null });
});


export const LlmModelController = { postLlmModel, getAllLlmModel, getSingleLlmModel, updateLlmModel, deleteLlmModel };
