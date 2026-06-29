import express from "express";
import salesController from "../controllers/salesController.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Solo Admin puede acceder a todas las ventas
router
  .route("/")
  .get(validateAuthCookie(["Admin"]), salesController.getSales)
  .post(validateAuthCookie(["Admin"]), salesController.insertSale);

// Reporte resumen de ventas
router
  .route("/summary")
  .get(validateAuthCookie(["Admin"]), salesController.getSalesSummary);

// Ventas por rango de fechas
router
  .route("/date-range")
  .post(validateAuthCookie(["Admin"]), salesController.getSalesByDateRange);

router
  .route("/:id")
  .get(validateAuthCookie(["Admin"]), salesController.getSaleById)
  .put(validateAuthCookie(["Admin"]), salesController.updateSaleStatus);

export default router;
