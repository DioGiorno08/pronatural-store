import express from "express";
import loginClientesController from "../controller/login.js";

const router = express.Router();

router.route("/").post(loginClientesController.login);

export default router;