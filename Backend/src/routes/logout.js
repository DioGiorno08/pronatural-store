import express from "express";
import logoutController from "../controller/logoutController.js";

const router = express.Router();

router.route("/").post(logoutController.logout);

export default router;