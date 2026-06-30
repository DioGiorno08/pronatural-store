import express from "express";
import salesController from "../controllers/VentasController.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Solo Admin puede acceder a todas las ventas
router
  .route("/")
  .get(validateAuthCookie(["Admin"]), salesController.getSales)
  .post(salesController.insertSale);

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
  .get(validateAuthCookie(["Admin", "Employee"]), salesController.getSaleById)
  .put(validateAuthCookie(["Admin"]), salesController.updateSaleStatus);

// Enviar factura digital por correo
router
  .route("/:id/invoice")
  .post(validateAuthCookie(["Admin", "Employee"]), salesController.sendInvoiceEmail);

export default router;
