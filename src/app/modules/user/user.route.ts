import express from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middleWear/validateRequest";
import { addressValidationSchema, UserValidations } from "./user.validation";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";
import { upload } from "../../utils/sendFileToCloudinary";
import { cartController } from "../cart/cart.controller";

const router = express.Router();

router.get("/", auth(USER_ROLE.ADMIN), UserControllers.getAllUsers);
router.get("/me", auth(USER_ROLE.USER, USER_ROLE.ADMIN), UserControllers.getMe);
router.post(
  "/register",
  validateRequest(UserValidations.createUserValidationSchema),
  UserControllers.createAUser
);
router.put('/update-profile', auth(USER_ROLE.ADMIN, USER_ROLE.USER), UserControllers.updateUserProfile);

router.post("/verify", UserControllers.verifyOTP);
router.post("/resend-verification", UserControllers.resendVerificationCode);

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

router.get(
  "/get-address",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  cartController.getAddress
);
router.post(
  "/post-address",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validateRequest(addressValidationSchema),
  cartController.postAddress
);

router.put(
  "/update-address/:id",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  cartController.updateAddress
);

export const UserRoutes = router;
