
import express from "express";
import { tokenLogController } from "./tokenLog.controller";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";
const router = express.Router();

router.get("/get-all-token-log", auth(USER_ROLE.ADMIN), tokenLogController.getAllTokenLog);
router.get("/user-get-token-log", auth(USER_ROLE.USER), tokenLogController.UserGetHerTokenLog)
router.get("/get-single-token-log/:id",auth(USER_ROLE.USER, USER_ROLE.ADMIN) , tokenLogController.getSingleTokenLog);
router.delete("/delete-token-log/:id",auth( USER_ROLE.ADMIN), tokenLogController.deleteTokenLog);

export const tokenLogRoutes = router;