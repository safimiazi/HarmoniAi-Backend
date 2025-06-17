import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        pricingPlanId: { type: Schema.Types.ObjectId, ref: 'Pricing', required: true },
        stripePaymentIntentId: { type: String, required: false }, // for one-time payment
        stripeCustomerId: { type: String, required: true },
        // Your internal status
        status: {
            type: String,
            enum: ["pending", "active", "canceled", "expired", "failed"],
            default: "pending",
            required: true,
        },

        // Stripe raw status
        stripeStatus: {
            type: String, // "paid", "incomplete", etc.
        },
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