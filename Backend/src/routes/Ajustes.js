import express from "express";
import controladoresAjustes from "../controllers/AjustesController.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(controladoresAjustes.getConfig) // Public / Admin can read
  .put(validateAuthCookie(["Admin"]), controladoresAjustes.updateConfig); // Only admin can update

router
  .route("/send-report")
  .post(validateAuthCookie(["Admin"]), controladoresAjustes.sendInventoryReport);

export default router;
