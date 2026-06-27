import express from "express";
import registerClientesController from "../controllers/registerClientesController.js";

const router = express.Router();

router.route("/").post(registerClientesController.register);
router.route("/verifyCodeEmail").post(registerClientesController.verifyCode);

export default router;

