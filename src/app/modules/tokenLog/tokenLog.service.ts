import { tokenLogModel } from "./tokenLog.model";
import { TOKENLOG_SEARCHABLE_FIELDS } from "./tokenLog.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";





export const tokenLogService = {

  async getAllTokenLogFromDB(query: any) {
    try {

      const service_query = new QueryBuilder(tokenLogModel.find(), query)
        .search(TOKENLOG_SEARCHABLE_FIELDS)
        .filter()
        .sort()
        .paginate()
        .fields();

      const result = await service_query.modelQuery.populate("user").populate("plan");
      const meta = await service_query.countTotal();
      return {
        result,
        meta,
      };

    } catch (error: unknown) {
      throw error;
    }
  },
  async UserGetHerTokenLogFromDB(query: any, userId: string) {
    try {

      const service_query = new QueryBuilder(tokenLogModel.find({user: userId}), query)
        .search(TOKENLOG_SEARCHABLE_FIELDS)
        .filter()
        .sort()
        .paginate()
        .fields();

      const result = await service_query.modelQuery.populate("user").populate("plan");
      const meta = await service_query.countTotal();
      return {
        result,
        meta,
      };

    } catch (error: unknown) {
      throw error;
    }
  },


  async getSingleTokenLogFromDB(id: string) {
    try {
      const result = await tokenLogModel.findById(id).populate("user").populate("plan");
      if(!result){
        throw new ApiError(httpStatus.NOT_FOUND, "Data not found")
      }
      if (result?.isDeleted) {
        throw new ApiError(httpStatus.NOT_FOUND, "Data already deleted!")
      }
      return result;
    } catch (error: unknown) {
      throw error;
    }
  },

  async deleteTokenLogFromDB(id: string) {
    try {

      // Step 1: Check if the tokenLog exists in the database
      const isExist = await tokenLogModel.findOne({ _id: id });

      if (!isExist) {
        throw new ApiError(status.NOT_FOUND, "Token log not found");
      }

      // Step 4: Delete the home tokenLog from the database
      await tokenLogModel.updateOne({ _id: id }, { isDeleted: true });
      return;

    } catch (error: unknown) {
      throw error;
    }
  },
};