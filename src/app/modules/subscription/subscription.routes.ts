import express from "express";
import {

  createCheckoutSession,
  getMyTransactions,
  getSingleTransaction,
  getTransactions,
} from "./subscription.controller";
import USER_ROLE from "../../constants/userRole";
import auth from "../../middleWear/auth";

const router = express.Router();


router.post("/create-checkout-session", auth(USER_ROLE.USER, USER_ROLE.ADMIN), createCheckoutSession);
router.get("/all-transaction", auth(USER_ROLE.ADMIN), getTransactions);
router.get("/transaction/:transactionId", auth(USER_ROLE.ADMIN, USER_ROLE.USER), getSingleTransaction);
router.get(
  "/transactions/my",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  getMyTransactions
);

// router.post("/cancel-subscription", cancelSubscription);

// router.get("/subscription-status", getSubscriptionStatus);


export const subscriptionRoutes = router;

