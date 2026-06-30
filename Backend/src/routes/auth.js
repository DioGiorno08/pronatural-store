import { Router } from "express";
import authController from "../controllers/authController.js";

const router = Router();

router.route("/register").post(authController.register);
router.route("/verifyCode").post(authController.verifyCode);
router.route("/login").post(authController.login);
router.route("/logout").post(authController.logout);
router.route("/forceChangePassword").post(authController.forceChangePassword);

export default router;
