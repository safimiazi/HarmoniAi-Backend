
import express from "express";
import { configureController } from "./configure.controller";
import USER_ROLE from "../../constants/userRole";
import auth from "../../middleWear/auth";

const router = express.Router();

router.get("/get-configure", configureController.getAllConfigure);
router.get("/get_single_configure/:id", auth(USER_ROLE.ADMIN), configureController.getSingleConfigure);
router.put("/update-configure/:id", auth(USER_ROLE.ADMIN), configureController.updateConfigure);
export const configureRoutes = router;