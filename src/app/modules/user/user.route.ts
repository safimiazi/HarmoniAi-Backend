import express from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middleWear/validateRequest";
import { UserValidations } from "./user.validation";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";
import { upload } from "../../utils/sendFileToCloudinary";

const router = express.Router();

router.get("/:id", UserControllers.getSingleUser);
router.get("/",auth(USER_ROLE.ADMIN), UserControllers.getAllUsers);
router.post(
  "/createAUser",
  validateRequest(UserValidations.createUserValidationSchema),
  UserControllers.createAUser
);

router.post(
  "/upload-image",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  upload.single("file"),
  UserControllers.uploadImage
);

router.patch(
  "/language",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  validateRequest(UserValidations.changeLanguageValidationSchema),
  UserControllers.changeUserLanguage
);
router.patch(
  "/theme",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  validateRequest(UserValidations.changeThemeValidationSchema),
  UserControllers.changeUserTheme
);

router.patch(
  "/delete/:id",
  auth(USER_ROLE.ADMIN),
  validateRequest(UserValidations.deleteUserValidationSchema),
  UserControllers.toggleUserDelete
);

export const UserRoutes = router;
