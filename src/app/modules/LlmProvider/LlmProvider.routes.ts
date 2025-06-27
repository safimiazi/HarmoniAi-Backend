
import express from "express";
import { LlmProviderController } from "./LlmProvider.controller";
import { LlmProviderPostValidation, LlmProviderUpdateValidation } from "./LlmProvider.validation";
import { validateRequest } from "../../middleWear/validateRequest";

const router = express.Router();

router.post("/post-llm-provider", validateRequest(LlmProviderPostValidation), LlmProviderController.postLlmProvider);
router.get("/get-all-llm-provider", LlmProviderController.getAllLlmProvider);
router.get("/get-single-provider/:id", LlmProviderController.getSingleLlmProvider);
router.put("/update-llm-provider/:id", validateRequest(LlmProviderUpdateValidation), LlmProviderController.updateLlmProvider);
router.delete("/delete-llm-provider/:id", LlmProviderController.deleteLlmProvider);

export const LlmProviderRoutes = router;