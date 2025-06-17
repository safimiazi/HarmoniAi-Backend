import { subscriptionModel } from "./subscription.model";
import { SUBSCRIPTION_SEARCHABLE_FIELDS } from "./subscription.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";






export const subscriptionService = {
  async postSubscriptionIntoDB(data: any) {
    try {
      return await subscriptionModel.create(data);
    } catch (error: unknown) {
      throw error;
    }
  },


  async getAllTransactionFromDB(query: any) {
    try {

      const service_query = new QueryBuilder(subscriptionModel.find(), query)
        .search(SUBSCRIPTION_SEARCHABLE_FIELDS)
        .filter()
        .sort()
        .paginate()
        .fields();

      const populatedResults = await service_query.modelQuery
        .populate("userId")
        .populate("pricingPlanId");

      const result = populatedResults.map((sub: any) => ({
        _id: sub._id,
        user: sub.userId, // renamed
        pricingPlan: sub.pricingPlanId, // renamed
        stripePaymentIntentId: sub.stripePaymentIntentId,
        stripeCustomerId: sub.stripeCustomerId,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        status: sub.status,
        amountPaid: sub.amountPaid,
        currency: sub.currency,
        paymentDate: sub.paymentDate,
        isRecurring: sub.isRecurring,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      }));
      const meta = await service_query.countTotal();
      return {
        result,
        meta,
      };

    } catch (error: unknown) {
      throw error;

    }
  },


  async getUserTransactionsFromDB(userId: string, query: any) {
    try {
      const service_query = new QueryBuilder(
        subscriptionModel.find({ userId }), // 👈 Only current user's transactions
        query
      )
        .search(SUBSCRIPTION_SEARCHABLE_FIELDS)
        .filter()
        .sort()
        .paginate()
        .fields();

      const populatedResults = await service_query.modelQuery
        .populate("userId")
        .populate("pricingPlanId");

      const result = populatedResults.map((sub: any) => ({
        _id: sub._id,
        user: sub.userId,
        pricingPlan: sub.pricingPlanId,
        stripePaymentIntentId: sub.stripePaymentIntentId,
        stripeCustomerId: sub.stripeCustomerId,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        status: sub.status,
        amountPaid: sub.amountPaid,
        currency: sub.currency,
        paymentDate: sub.paymentDate,
        isRecurring: sub.isRecurring,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      }));

      const meta = await service_query.countTotal();

      return {
        result,
        meta,
      };
    } catch (error: unknown) {
      throw error;
    }
  }

  ,
  async getSingleTransactionFromDB(id: string, userId: string) {
    try {
      const sub = await subscriptionModel
        .findOne({ _id: id, userId })
        .populate("userId")
        .populate("pricingPlanId");

      if (!sub) {
        throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found or access denied.");
      }

      const result = {
        _id: sub._id,
        user: sub.userId,
        pricingPlan: sub.pricingPlanId,
        stripePaymentIntentId: sub.stripePaymentIntentId,
        stripeCustomerId: sub.stripeCustomerId,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        status: sub.status,
        amountPaid: sub.amountPaid,
        currency: sub.currency,
        paymentDate: sub.paymentDate,
        isRecurring: sub.isRecurring,

      };

      return result;
    } catch (error: unknown) {
      throw error;
    }
  }
  ,


  async updateSubscriptionIntoDB(data: any) {
    try {





      const result = await subscriptionModel.updateOne({ _id: data.id }, data, {
        new: true,
      });
      if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "subscription not found.");
      }
      return result;


    } catch (error: unknown) {
      throw error;
    }
  },
  async deleteSubscriptionFromDB(id: string) {
    try {


      // Step 1: Check if the subscription exists in the database
      const isExist = await subscriptionModel.findOne({ _id: id });



      // Step 4: Delete the home subscription from the database
      await subscriptionModel.updateOne({ _id: id }, { isDelete: true });
      return;

    } catch (error: unknown) {
      throw error;
    }
  },
};