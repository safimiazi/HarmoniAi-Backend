
import express from "express";
import { LlmModelController } from "./LlmModel.controller";
import { LlmModelPostValidation, LlmModelUpdateValidation } from "./LlmModel.validation";
import { validateRequest } from "../../middleWear/validateRequest";
import { upload } from "../../utils/sendFileToCloudinary";

const router = express.Router();

router.post("/post-llm-model", upload.single("thumbnail"), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
}, validateRequest(LlmModelPostValidation), LlmModelController.postLlmModel);
router.get("/get-all-llm-model", LlmModelController.getAllLlmModel);
router.get("/get-single-llm-model/:id", LlmModelController.getSingleLlmModel);
router.put("/update-llm-model/:id",upload.single("thumbnail"), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
}, validateRequest(LlmModelUpdateValidation), LlmModelController.updateLlmModel);
router.delete("/delete-model/:id", LlmModelController.deleteLlmModel);

export const LlmModelRoutes = router;