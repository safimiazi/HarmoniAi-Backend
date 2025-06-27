import { PricingModel } from "./Pricing.model";
import { PRICING_SEARCHABLE_FIELDS } from "./Pricing.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { stripe } from "../../utils/stripe";

export const PricingService = {
  async postPricingIntoDB(data: any) {
    try {
      // Prepare dynamic query for duplicate check
      const duplicateQuery: any = {
        name: data.name,
        type: data.type,
        isDeleted: false,
      };

      if (data.type === 'recurring') {
        if (!data.interval || !['month', 'year'].includes(data.interval)) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Recurring plans require a valid interval ('month' or 'year')"
          );
        }
        duplicateQuery.interval = data.interval;
      }

      const existingPricing = await PricingModel.findOne(duplicateQuery);

      if (existingPricing) {
        throw new ApiError(
          httpStatus.CONFLICT,
          'A pricing plan with this name, type, and interval already exists.'
        );
      }

      // const existingPricing = await PricingModel.findOne({
      //   name: data.name,
      //   isDeleted: false,
      // })

      // if (existingPricing) {
      //   throw new ApiError(httpStatus.CONFLICT, "A pricing plan with this name already exists.")
      // }
      //  If plan type is recurring, create Stripe Product & Price
      if (data.type === "recurring") {
        if (!data.interval || !["month", "year"].includes(data.interval)) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Recurring plans require a valid interval ('month' or 'year')"
          );
        }

        // 1. Create Stripe product
        const stripeProduct = await stripe.products.create({
          name: data.name,

        });

        // 2. Create Stripe recurring price
        const stripePrice = await stripe.prices.create({
          unit_amount: data.price * 100, // price in cents
          currency: "usd",
          recurring: {
            interval: data.interval, // 'month' or 'year'
          },
          product: stripeProduct.id,
        });

        // 3. Attach stripePriceId to the data
        data.stripePriceId = stripePrice.id;
      }

      // create Pricing in MongoDB:
      return await PricingModel.create(data)


    } catch (error: unknown) {
      throw error;
    }
  },

  async getAllPricingFromDB(query: any) {
    try {
      const service_query = new QueryBuilder(PricingModel.find(), query)
        .search(PRICING_SEARCHABLE_FIELDS)
        .filter()
        .sort()
        .paginate()
        .fields();

      const result = await service_query.modelQuery;
      const meta = await service_query.countTotal();
      return { result, meta };
    } catch (error: unknown) {
      throw error;
    }
  },

  async getSinglePricingFromDB(id: string) {
    try {
      const pricing = await PricingModel.findOne({ _id: id, isDeleted: false });

      if (!pricing) {
        throw new ApiError(httpStatus.NOT_FOUND, "Pricing not found or has been deleted.");
      }

      return pricing;
    } catch (error: unknown) {
      throw error;

    }
  },

  async updatePricingIntoDB(data: any) {
    try {
      const existingPricing = await PricingModel.findOne({ _id: data.id });

      if (!existingPricing) {
        throw new ApiError(httpStatus.NOT_FOUND, "Pricing not found.");
      }

      if (existingPricing.isDeleted) {
        throw new ApiError(httpStatus.GONE, "Cannot update: pricing has been deleted.");
      }

      const result = await PricingModel.findByIdAndUpdate(data.id, data, { new: true });

      return result;
    } catch (error: unknown) {
      throw error;

    }
  },

  async deletePricingFromDB(id: string) {
    try {
      const pricing = await PricingModel.findOne({ _id: id });

      if (!pricing) {
        throw new ApiError(httpStatus.NOT_FOUND, "Pricing not found.");
      }

      if (pricing.isDeleted) {
        throw new ApiError(httpStatus.GONE, "Pricing is already deleted.");
      }

      await PricingModel.updateOne({ _id: id }, { isDeleted: true });

      return;
    } catch (error: unknown) {
      throw error;

    }
  },
};
