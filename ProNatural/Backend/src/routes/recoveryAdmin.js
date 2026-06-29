import express from "express";
import recoveryAdminController from "../controllers/recoveryAdminController.js";

const router = express.Router();

router.post("/requestCode", recoveryAdminController.requestCode);
router.post("/verifyCode", recoveryAdminController.verifyCode);
router.post("/newPassword", recoveryAdminController.newPassword);

export default router;
