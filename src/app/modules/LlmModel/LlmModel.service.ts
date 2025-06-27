import { LLMMODEL_SEARCHABLE_FIELDS } from "./LlmModel.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import LlmModelModel from "./LlmModel.model";
import ApiError from "../../errors/ApiError";
import mongoose from "mongoose";
import LlmProviderModel from "../LlmProvider/LlmProvider.model";
import httpStatus from "http-status";
import { sendFileToCloudinary } from "../../utils/sendFileToCloudinary";





export const LlmModelService = {
  async postLlmModelIntoDB(data: any, file: any) {




    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const isExist: any = await LlmModelModel.findOne({ name: data.name }).session(session)
      if (isExist) {
        throw new Error("LLM Model with this name already exists.")
      }

      if (!file)
        throw new ApiError(httpStatus.BAD_REQUEST, "Please provide an image first");

      const imageName = `${data.name}-${Date.now()}`;
      const cloudinary_response = (await sendFileToCloudinary(
        imageName,
        file?.path,
        "thumbnail"
      )) as { secure_url: string };

      const createModel = await LlmModelModel.create([{ ...data, thumbnail_url: cloudinary_response.secure_url }], { session });
      const model = createModel[0];
      await LlmProviderModel.findByIdAndUpdate(
        data.provider,
        { $addToSet: { models: model._id } },
        { new: true, session }
      )
      await session.commitTransaction();
      session.endSession();

      return createModel;
    } catch (error: unknown) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },
  async getAllLlmModelFromDB(query: any) {
    try {


      const service_query = new QueryBuilder(LlmModelModel.find(), query)
        .search(LLMMODEL_SEARCHABLE_FIELDS)
        .filter()
        .sort()
        .paginate()
        .fields();

      const result = await service_query.modelQuery.populate("provider");
      const meta = await service_query.countTotal();
      return {
        result,
        meta,
      };

    } catch (error: unknown) {
      throw error;
    }
  },

  async getSingleLlmModelFromDB(id: string) {
    try {
      const result = await LlmModelModel.findById(id).populate("provider")
      if (!result || result.isDeleted) {
        throw new ApiError(status.NOT_FOUND, "LLM Model not found")
      }
      return result;
    } catch (error: unknown) {
      throw error;
    }
  },

  async updateLlmModelIntoDB(data: any, file: any) {
    try {

      if (!file)
        throw new ApiError(httpStatus.BAD_REQUEST, "Please provide an image first");

      const imageName = `${data.name}-${Date.now()}`;
      const cloudinary_response = (await sendFileToCloudinary(
        imageName,
        file?.path,
        "thumbnail"
      )) as { secure_url: string };

      const isDeleted = await LlmModelModel.findOne({ _id: data.id });
      if (isDeleted?.isDeleted) {
        throw new ApiError(status.NOT_FOUND, "LLM Model is already deleted");
      }

      const result = await LlmModelModel.updateOne({ _id: data.id }, { ...data, thumbnail_url: cloudinary_response.secure_url }, {
        new: true,
      });
      if (!result) {
        throw new Error("LLM Model not found.");
      }
      return result;


    } catch (error: unknown) {
      throw error;
    }
  },
  async deleteLlmModelFromDB(id: string) {
    try {


      // Step 1: Check if the LlmModel exists in the database
      const isExist = await LlmModelModel.findOne({ _id: id });

      if (!isExist) {
        throw new ApiError(status.NOT_FOUND, "LLM Model not found");
      }

      // Step 4: Delete the home LlmModel from the database
      await LlmModelModel.updateOne({ _id: id }, { isDeleted: true });
      return;

    } catch (error: unknown) {
      throw error;
    }
  },
};