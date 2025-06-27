import { LLMPROVIDER_SEARCHABLE_FIELDS } from "./LlmProvider.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import LlmProviderModel from "./LlmProvider.model";
import ApiError from "../../errors/ApiError";





export const LlmProviderService = {
  async postLlmProviderIntoDB(data: any) {
    try {
      const isExist = await LlmProviderModel.findOne({ name: data.name });
      if (isExist) {
        throw new Error("LLM Provider with this name already exists.")
      }

      return await LlmProviderModel.create(data);
    } catch (error: unknown) {
      throw error;
    }
  },
  async getAllLlmProviderFromDB(query: any) {
    try {


      const service_query = new QueryBuilder(LlmProviderModel.find(), query)
        .search(LLMPROVIDER_SEARCHABLE_FIELDS)
        .filter()
        .sort()
        .paginate()
        .fields();

      const result = await service_query.modelQuery.populate("models");
      const meta = await service_query.countTotal();
      return {
        result,
        meta,
      };

    } catch (error: unknown) {
      throw error;
    }
  },
  async getSingleLlmProviderFromDB(id: string) {
    try {
      const result = await LlmProviderModel.findById(id);

      if (!result) {
        throw new ApiError(status.NOT_FOUND, "LLM Provider not found")
      }
      if (result.isDeleted) {
        throw new ApiError(status.NOT_FOUND, "LLM Provider is deleted")
      }
    } catch (error: unknown) {
      throw error;
    }
  },
  async updateLlmProviderIntoDB(data: any) {
    try {

      const isDeleted = await LlmProviderModel.findOne({ _id: data.id });
      if (isDeleted?.isDeleted) {
        throw new ApiError(status.NOT_FOUND, "LlmProvider is already deleted");
      }

      const result = await LlmProviderModel.updateOne({ _id: data.id }, data, {
        new: true,
      });
      if (!result) {
        throw new Error("LlmProvider not found.");
      }
      return result;


    } catch (error: unknown) {
      throw error;
    }
  },
  async deleteLlmProviderFromDB(id: string) {
    try {


      // Step 1: Check if the LlmProvider exists in the database
      const isExist = await LlmProviderModel.findOne({ _id: id });

      if (!isExist) {
        throw new ApiError(status.NOT_FOUND, "LlmProvider not found");
      }

      // Step 4: Delete the home LlmProvider from the database
      await LlmProviderModel.updateOne({ _id: id }, { isDeleted: true });
      return;

    } catch (error: unknown) {
      throw error;
    }
  },
};