// controllers/subscriptionController.ts
import { NextFunction, Request, Response } from "express";

// Extend the Request interface to include a user property
declare global {
  namespace Express {
    interface User {
      _id: string;
    }
    interface Request {
      user?: User;
    }
  }
}
import { PricingModel } from "../Pricing/Pricing.model";
import { stripe } from "../../utils/stripe";
import { subscriptionModel } from "./subscription.model";
import config from "../../config";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { User } from "../user/user.model";
import mongoose from "mongoose";
import { subscriptionService } from "./subscription.service";
import sendResponse from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { tokenLogModel } from "../tokenLog/tokenLog.model";

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { pricingPlanId, userId, email } = req.body;

  const plan = await PricingModel.findById(pricingPlanId);
  if (!plan) return res.status(404).json({ message: "Plan not found" });

  // create a new stripe customer 
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
      pricingPlanId,
    },
  });
  //prepare checkout session configuration:
  const sessionConfig: any = {
    customer: customer.id,
    payment_method_types: ["card"],
    success_url: `${process.env.CLIENT_URL}/subscription-success`,
    cancel_url: `${process.env.CLIENT_URL}/subscription-cancel`,
    metadata: {
      userId,
      pricingPlanId,
    },
  };

  //Determine if its a one-time or recurrinog purchase:
  if (plan.type === "one_time") {
    sessionConfig.mode = "payment";
    sessionConfig.line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: plan.name,
          },
          unit_amount: plan.price * 100, // USD in cents
        },
        quantity: 1,
      },
    ];
  } else if (plan.type === "recurring") {
    sessionConfig.mode = "subscription";
    sessionConfig.line_items = [
      {
        price: plan.stripePriceId,
        quantity: 1,

      }
    ]
  }

  // create the stripe checkout session:
  const session = await stripe.checkout.sessions.create(sessionConfig);

  res.json({ url: session.url });
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const webhookSecret = config.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing Stripe signature or webhook secret");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    throw new ApiError(httpStatus.BAD_REQUEST, `Webhook Error: ${err.message}`);
  }

  // 1️⃣ Handle ONE-TIME payment (non-subscription)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    if (session.payment_status !== "paid") {
      throw new ApiError(httpStatus.BAD_REQUEST, "Payment was not successful");
    }

    const { userId, pricingPlanId } = session.metadata;

    // ✅ Check plan type
    const plan = await PricingModel.findById(pricingPlanId);
    if (!plan) throw new ApiError(httpStatus.NOT_FOUND, "Pricing plan not found");

    // ❌ If recurring, skip processing here — it's handled in `invoice.paid`
    if (plan.type === "recurring") {
      console.log("ℹ️ Recurring plan detected. Skipping processing in checkout.session.completed. Handled in invoice.paid.");
      return res.status(200).send();
    }

    // ✅ One-time payment processing
    const sessionDb = await mongoose.startSession();
    sessionDb.startTransaction();

    try {
      // Prevent duplicate processing
      const exists = await subscriptionModel.findOne({
        stripePaymentIntentId: session.payment_intent,
      }).session(sessionDb);

      if (exists) {
        console.log("⚠️ Subscription already exists for this payment intent. Skipping.");
        await sessionDb.abortTransaction();
        return res.status(200).send();
      }

      // Save one-time subscription record
      await subscriptionModel.create([{
        userId,
        pricingPlanId,
        stripePaymentIntentId: session.payment_intent,
        stripeCustomerId: session.customer,
        stripeStatus: session.payment_status,
        status: "active", // ✅ add this line

        amountPaid: session.amount_total,
        currency: session.currency,
        stripeSubscriptionId: null,
        isRecurring: false,
      }], { session: sessionDb });

      // Add tokens to user's account
      await User.findByIdAndUpdate(
        userId,
        { $inc: { token: plan.token } },
        { new: true, session: sessionDb }
      );

      const user = await User.findById(userId).session(sessionDb);
      const previousToken = user?.token || 0;
      const newToken = previousToken + plan.token;

      await tokenLogModel.create([{
        userId,
        source: "one_time",
        planId: pricingPlanId,
        tokenAdded: plan.token,
        newToken,
        previousToken,
        stripeEventId: session.payment_intent,
        note: "One-time token purchase"
      }], { session: sessionDb });


      await sessionDb.commitTransaction();
    } catch (error) {
      await sessionDb.abortTransaction();
      console.error("❌ One-time webhook processing failed:", error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Stripe webhook processing failed");
    } finally {
      sessionDb.endSession();
    }
  }

  // 2️⃣ Handle RECURRING subscription renewal (invoice.paid)
  if (event.type === "invoice.paid") {
    const invoice = event.data.object as any;
    const subscriptionId = invoice.subscription || invoice?.parent?.subscription_details?.subscription;

    const customerId = invoice.customer;



    const sessionDb = await mongoose.startSession();
    sessionDb.startTransaction();

    try {
      // Get user & plan from Stripe customer metadata
      const customer = await stripe.customers.retrieve(customerId) as any;
      const userId = customer.metadata?.userId;
      const pricingPlanId = customer.metadata?.pricingPlanId;

      if (!userId || !pricingPlanId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Missing metadata for subscription");
      }

      const plan = await PricingModel.findById(pricingPlanId).session(sessionDb);
      if (!plan) {
        throw new ApiError(httpStatus.NOT_FOUND, "Recurring pricing plan not found");
      }

      // Prevent duplicate processing for renewals
      const exists = await subscriptionModel.findOne({
        stripeSubscriptionId: subscriptionId,
        amountPaid: invoice.amount_paid,
      }).session(sessionDb);

      if (exists) {
        console.log("⚠️ Recurring payment already logged. Skipping.");
        await sessionDb.abortTransaction();
        return res.status(200).send();
      }

      // Save recurring payment subscription record
      await subscriptionModel.create([{
        userId,
        pricingPlanId,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: customerId,
        stripeStatus: invoice.status,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
        status: "active", // ✅ add this line
        isRecurring: true,
      }], { session: sessionDb });

      // Add tokens to user's account on each successful renewal
      await User.findByIdAndUpdate(
        userId,
        { $inc: { token: plan.token } },
        { new: true, session: sessionDb }
      );

      const user = await User.findById(userId).session(sessionDb);
      const previousToken = user?.token || 0;
      const newToken = previousToken + plan.token;

      await tokenLogModel.create([{
        userId,
        source: "subscription",
        planId: pricingPlanId,
        tokenAdded: plan.token,
        newToken,
        previousToken,
        stripeEventId: invoice.id,
        note: "Recurring token renewal"
      }], { session: sessionDb });


      await sessionDb.commitTransaction();
    } catch (error) {
      await sessionDb.abortTransaction();
      console.error("❌ Subscription renewal webhook failed:", error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Recurring Stripe webhook failed");
    } finally {
      sessionDb.endSession();
    }
  }

  // ✅ Always acknowledge to prevent webhook retry
  res.status(200).send();
};

export const getMyTransactions = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.loggedInUser;

  const result = await subscriptionService.getUserTransactionsFromDB(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Fetched transactions successfully",
    data: result,
  });
});




export const getTransactions = catchAsync(async (req: Request, res: Response) => {
  const result = await subscriptionService.getAllTransactionFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Fetched transactions successfully",
    data: result,
  });
});
export const getSingleTransaction = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.loggedInUser;
  const result = await subscriptionService.getSingleTransactionFromDB(req.params.transactionId, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Fetched transaction successfully",
    data: result,
  });
});




// export const cancelSubscription = async (req: Request, res: Response) => {
//   const { subscriptionId } = req.body;

//   const subscription = await subscriptionModel.findOne({
//     stripeSubscriptionId: subscriptionId,
//   });
//   if (!subscription)
//     return res.status(404).json({ message: "Subscription not found" });

//   await stripe.subscriptions.cancel(subscriptionId);
//   subscription.status = "canceled";
//   await subscription.save();

//   res.json({ message: "Subscription canceled" });
// };

// export const checkSubscription = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const userId = req.user?._id || req.body.userId;

//   const subscription = await subscriptionModel
//     .findOne({ userId })
//     .sort({ currentPeriodEnd: -1 });

//   if (
//     !subscription ||
//     subscription.status !== "active"
//   ) {
//     return res
//       .status(403)
//       .json({
//         message: "You need an active subscription to access this feature.",
//       });
//   }

//   next();
// };


// export const getSubscriptionStatus = async (req: Request, res: Response) => {
//   const userId = req.user?._id || req.body.userId;

//   const subscription = await subscriptionModel.findOne({ userId }).sort({ currentPeriodEnd: -1 });

//   if (!subscription) {
//     return res.json({ isActive: false });
//   }

//   const isActive =
//     subscription.status === 'active';

//   res.json({ isActive });
// };


