import { Router } from "express";
import { conversationController } from "./conversation.controller";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";
import { validateRequest } from "../../middleWear/validateRequest";
import { ConversationValidations } from "./conversation.validation";

const router = Router();

router.post(
  "/create-conversation",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validateRequest(
    ConversationValidations.createConversationNameValidationSchema
  ),
  conversationController.createConversartion
);

router.post(
  "/add-message",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  conversationController.addAMessage
);

router.get(
  "/",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  conversationController.getAllConversations
);

router.get(
  "/get-all-message",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  conversationController.getAllMessage
);

router.get(
  "/:conversationId",
  // auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  conversationController.getMessagesFromConversation
);
router.get(
  "/infinite-scroll/:conversationId",
  // auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  conversationController.getMessagesFromConversationWithInfiniteScroll
);

router.delete(
  "/delete-conversation/:conversationId",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  conversationController.deleteConversation
);

router.patch(
  "/change-name/:conversationId",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validateRequest(
    ConversationValidations.updateConversationNameValidationSchema
  ),
  conversationController.changeConversationName
);

export const ConversationRoutes = router;
