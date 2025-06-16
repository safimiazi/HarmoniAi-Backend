import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        pricingPlanId: { type: Schema.Types.ObjectId, ref: 'Pricing', required: true },
        stripePaymentIntentId: { type: String, required: false }, // for one-time payment
        stripeCustomerId: { type: String, required: true },
        status: { type: String, required: true }, // e.g., "succeeded", "failed", etc.
        amountPaid: { type: Number }, // in cents
        stripeSubscriptionId: {
            type: String,
            required: false, // only for recurring
        },
        currency: { type: String, default: 'usd' },
        paymentDate: { type: Date, default: Date.now },
        isRecurring: {
            type: Boolean,
            default: false,
        },
    }
);

export const subscriptionModel = mongoose.model("Subscription", subscriptionSchema);