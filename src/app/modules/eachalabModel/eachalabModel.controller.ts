import { Request, Response } from "express";
    import { eachalabModelService } from "./eachalabModel.service";
    import sendResponse from "../../utils/sendResponse";
    import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
    
    const postEachalabModel = catchAsync(async (req: Request, res: Response) => {
      const { file} = req;
      const result = await eachalabModelService.postEachalabModelIntoDB(req.body, file);
      sendResponse(res, { statusCode: status.CREATED, success: true, message: "Created successfully", data: result });
    });
    
    const getAllEachalabModel = catchAsync(async (req: Request, res: Response) => {
      const result = await eachalabModelService.getAllEachalabModelFromDB(req.query);
      sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
    });
    
    const getSingleEachalabModel = catchAsync(async (req: Request, res: Response) => {
      const result = await eachalabModelService.getSingleEachalabModelFromDB(req.params.id);
      sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
    });
    
    const updateEachalabModel = catchAsync(async (req: Request, res: Response) => {
      req.body.id = req.params.id;
      const { file} = req;
  
      const result = await eachalabModelService.updateEachalabModelIntoDB(req.body, file);
      sendResponse(res, { statusCode: status.OK, success: true, message: "Updated successfully", data: result });
    });
    
    const deleteEachalabModel = catchAsync(async (req: Request, res: Response) => {
      await eachalabModelService.deleteEachalabModelFromDB(req.params.id);
      sendResponse(res, { statusCode: status.OK, success: true, message: "Deleted successfully",data: null });
    });

    
    export const eachalabModelController = { postEachalabModel, getAllEachalabModel, getSingleEachalabModel, updateEachalabModel, deleteEachalabModel };
    