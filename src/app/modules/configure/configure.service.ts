import { configureModel } from "./configure.model";
import { CONFIGURE_SEARCHABLE_FIELDS } from "./configure.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import ApiError from "../../errors/ApiError";


export const configureService = {


  async getAllConfigureFromDB(query: any) {
    try {
      const service_query = new QueryBuilder(configureModel.find(), query)
        .search(CONFIGURE_SEARCHABLE_FIELDS)
        .filter()
        .sort()
        .paginate()
        .fields();

      const result = await service_query.modelQuery;
     return result[0] || null; // Return the first configuration or null if none exists

    } catch (error: unknown) {
      throw error;

    }
  },
  async getSingleConfigureFromDB(id: string) {
    try {
      return await configureModel.findById(id);
    } catch (error: unknown) {
      throw error;

    }
  },

  async updateConfigureIntoDB(data: {
    dollerPerToken?: number;
    dailyTokenLimit?: number;
    id: string;
  }) {
    try {


      const isExisting = await configureModel.findOne({ _id: data.id });
      if (!isExisting) {
        throw new ApiError(status.NOT_FOUND, "Configuration not found");
      }

      // Update top-level fields:
      if (typeof data.dollerPerToken === 'number') {
        isExisting.dollerPerToken = data.dollerPerToken;
      }

      if (typeof data.dailyTokenLimit === 'number') {
        isExisting.dailyTokenLimit = data.dailyTokenLimit;
      }



      await isExisting.save();
      return isExisting;


    } catch (error: unknown) {
      throw error;

    }
  },

};