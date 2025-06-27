import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ConversationRoutes } from "../modules/conversation/conversation.routes";
import { cartRoutes } from "../modules/cart/cart.routes";
import { PricingRoutes } from "../modules/Pricing/Pricing.routes";
import { subscriptionRoutes } from "../modules/subscription/subscription.routes";
import { configureRoutes } from "../modules/configure/configure.routes";
import { tokenLogRoutes } from "../modules/tokenLog/tokenLog.routes";
import { LlmProviderRoutes } from "../modules/LlmProvider/LlmProvider.routes";
import { LlmModelRoutes } from "../modules/LlmModel/LlmModel.routes";
import { eachalabModelRoutes } from "../modules/eachalabModel/eachalabModel.routes";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/pricing",
    route: PricingRoutes,
  },
  {
    path: "/configure",
    route: configureRoutes,
  },
  {
    path: "/shop",
    route: cartRoutes,
  },
  {
    path: "/token-log",
    route: tokenLogRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/llm-provider",
    route: LlmProviderRoutes,
  },
  {
    path: "/llm-model",
    route: LlmModelRoutes,
  },

  {
    path: "/eachalab-model",
    route: eachalabModelRoutes,
  },
  {
    path: "/subscriptions",
    route: subscriptionRoutes,
  },
  {
    path: "/conversations",
    route: ConversationRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
