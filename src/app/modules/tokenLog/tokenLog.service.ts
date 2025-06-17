import { tokenLogModel } from "./tokenLog.model";
      import { TOKENLOG_SEARCHABLE_FIELDS } from "./tokenLog.constant";
    import QueryBuilder from "../../builder/QueryBuilder";
    import status from "http-status";
import ApiError from "../../errors/ApiError";
    




    export const tokenLogService = {
      async postTokenLogIntoDB(data: any) {
      try {
        return await tokenLogModel.create(data);
         } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(`${error.message}`);
          } else {
            throw new Error("An unknown error occurred while fetching by ID.");
          }
        }
      },
      async getAllTokenLogFromDB(query: any) {
      try {
    
    
      const service_query = new QueryBuilder(tokenLogModel.find(), query)
            .search(TOKENLOG_SEARCHABLE_FIELDS)
            .filter()
            .sort()
            .paginate()
            .fields();
      
          const result = await service_query.modelQuery;
          const meta = await service_query.countTotal();
          return {
            result,
            meta,
          };
    
         } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(`${error.message}`);
          } else {
            throw new Error("An unknown error occurred while fetching by ID.");
          }
        }
      },
      async getSingleTokenLogFromDB(id: string) {
        try {
        return await tokenLogModel.findById(id);
         } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(`${error.message}`);
          } else {
            throw new Error("An unknown error occurred while fetching by ID.");
          }
        }
      },
      async updateTokenLogIntoDB(data: any) {
      try {
    
    
    
      const isDeleted = await tokenLogModel.findOne({ _id: data.id });
        if (isDeleted?.isDeleted) {
          throw new ApiError(status.NOT_FOUND, "tokenLog is already deleted");
        }
    
        const result = await tokenLogModel.updateOne({ _id: data.id }, data, {
          new: true,
        });
        if (!result) {
          throw new Error("tokenLog not found.");
        }
        return result;
    
    
         } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(`${error.message}`);
          } else {
            throw new Error("An unknown error occurred while fetching by ID.");
          }
        }
      },
      async deleteTokenLogFromDB(id: string) {
        try {
    
    
     // Step 1: Check if the tokenLog exists in the database
        const isExist = await tokenLogModel.findOne({ _id: id });
    
        if (!isExist) {
          throw new ApiError(status.NOT_FOUND, "tokenLog not found");
        }
    
        // Step 4: Delete the home tokenLog from the database
        await tokenLogModel.updateOne({ _id: id }, { isDelete: true });
        return;
    
         } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(`${error.message}`);
          } else {
            throw new Error("An unknown error occurred while fetching by ID.");
          }
        }
      },
    };