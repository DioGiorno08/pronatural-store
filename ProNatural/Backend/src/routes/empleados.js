import express from "express";
import empleadosController from "../controllers/empleadosController.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(validateAuthCookie(["Admin"]), empleadosController.getEmpleados)
  .post(validateAuthCookie(["Admin"]), empleadosController.createEmpleado);

router.route("/:id")
  .get(validateAuthCookie(["Admin"]), empleadosController.getEmpleadoById)
  .put(validateAuthCookie(["Admin"]), empleadosController.updateEmpleado)
  .delete(validateAuthCookie(["Admin"]), empleadosController.deleteEmpleado);

export default router;
