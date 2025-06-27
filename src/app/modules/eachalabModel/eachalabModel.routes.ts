
    import express from "express";
    import { eachalabModelController } from "./eachalabModel.controller";
    import { eachalabModelPostValidation,eachalabModelUpdateValidation } from "./eachalabModel.validation";
import { validateRequest } from "../../middleWear/validateRequest";
import { upload } from "../../utils/sendFileToCloudinary";

    const router = express.Router();
    
    router.post("/post-eachalab-model", upload.single("thumbnail"), (req, res, next) => {
        req.body = JSON.parse(req.body.data);
        next();
    }, validateRequest(eachalabModelPostValidation), eachalabModelController.postEachalabModel);
    router.get("/get-all-eachalab-model", eachalabModelController.getAllEachalabModel);
    router.get("/get-single-eachalab-model/:id", eachalabModelController.getSingleEachalabModel);
    router.put("/update-eachalab-model/:id", upload.single("thumbnail"), (req, res, next) => {
        req.body = JSON.parse(req.body.data);
        next();
    }, validateRequest(eachalabModelUpdateValidation), eachalabModelController.updateEachalabModel);
    router.delete("/delete-eachalab-model/:id", eachalabModelController.deleteEachalabModel);
    
    export const eachalabModelRoutes = router;