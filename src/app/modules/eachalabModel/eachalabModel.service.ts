import { eachalabModelModel } from "./eachalabModel.model";
import { EACHALABMODEL_SEARCHABLE_FIELDS } from "./eachalabModel.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import { sendFileToCloudinary } from "../../utils/sendFileToCloudinary";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";





export const eachalabModelService = {
  async postEachalabModelIntoDB(data: any, file: any) {
    try {

      const isExist = await eachalabModelModel.findOne({ name: data.name })
      if (isExist) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Eachalab Model with this name already exists.")
      }
      if (!file)
        throw new ApiError(httpStatus.BAD_REQUEST, "Please provide an image first");

      const imageName = `${data.name}-${Date.now()}`;
      const cloudinary_response = (await sendFileToCloudinary(
        imageName,
        file?.path,
        "thumbnail"
      )) as { secure_url: string };
      return await eachalabModelModel.create({ ...data, thumbnail_url: cloudinary_response.secure_url });
    } catch (error: unknown) {
      throw error;
    }
  },
  async getAllEachalabModelFromDB(query: any) {
    try {


      const service_query = new QueryBuilder(eachalabModelModel.find(), query)
        .search(EACHALABMODEL_SEARCHABLE_FIELDS)
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
      throw error;
    }
  },

  async getSingleEachalabModelFromDB(id: string) {
    try {
      const result = await await eachalabModelModel.findById(id);
      if (!result) {
        throw new ApiError(status.NOT_FOUND, "Eachalab Model not found")
      }
      if (result.isDeleted) {
        throw new ApiError(status.NOT_FOUND, "Eachalab Model is deleted.")
      }
      return result;
    } catch (error: unknown) {
      throw error;
    }
  },

  async updateEachalabModelIntoDB(data: any, file: any) {
    try {
      const model = await eachalabModelModel.findOne({ _id: data.id });
      if (!model) {
        throw new ApiError(status.NOT_FOUND, "Eachalab Model not found.");
      }

      if (model.isDeleted) {
        throw new ApiError(status.NOT_FOUND, "Eachalab Model is already deleted.");
      }

      let updatedFields = { ...data };

      // If a new file is provided, upload and update thumbnail
      if (file) {
        const imageName = `${data.name}-${Date.now()}`;
        const cloudinary_response = await sendFileToCloudinary(
          imageName,
          file.path,
          "thumbnail"
        ) as { secure_url: string };

        updatedFields.thumbnail_url = cloudinary_response.secure_url;
      }

      const result = await eachalabModelModel.updateOne(
        { _id: data.id },
        updatedFields,
        { new: true }
      );

      if (!result) {
        throw new ApiError(status.NOT_FOUND, "Failed to update Eachalab Model.");
      }

      return result;

    } catch (error: unknown) {
      throw error;
    }
  },
  
  async deleteEachalabModelFromDB(id: string) {
    try {


      // Step 1: Check if the eachalabModel exists in the database
      const isExist = await eachalabModelModel.findOne({ _id: id });

      if (!isExist) {
        throw new ApiError(status.NOT_FOUND, "Eachalab Model not found");
      }

      // Step 4: Delete the home eachalabModel from the database
      await eachalabModelModel.updateOne({ _id: id }, { isDeleted: true });
      return;

    } catch (error: unknown) {
      throw error;
    }
  },
};