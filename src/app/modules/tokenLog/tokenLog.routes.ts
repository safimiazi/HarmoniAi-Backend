
import express from "express";
import { tokenLogController } from "./tokenLog.controller";
const router = express.Router();

router.post("/post_tokenLog", tokenLogController.postTokenLog);
router.get("/get_all_tokenLog", tokenLogController.getAllTokenLog);
router.get("/get_single_tokenLog/:id", tokenLogController.getSingleTokenLog);
router.put("/update_tokenLog/:id", tokenLogController.updateTokenLog);
router.delete("/delete_tokenLog/:id", tokenLogController.deleteTokenLog);

export const tokenLogRoutes = router;