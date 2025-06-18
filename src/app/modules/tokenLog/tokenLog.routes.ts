
import express from "express";
import { tokenLogController } from "./tokenLog.controller";
const router = express.Router();

router.get("/get-all-token-log", tokenLogController.getAllTokenLog);
router.get("/get-single-token-log/:id", tokenLogController.getSingleTokenLog);
router.delete("/delete-token-log/:id", tokenLogController.deleteTokenLog);

export const tokenLogRoutes = router;