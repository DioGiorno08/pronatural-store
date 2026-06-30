import { Router } from "express";
import carritoController from "../controllers/CarritoController.js";

const router = Router();

router.get("/:sessionId", carritoController.getCarrito);
router.post("/:sessionId/sync", carritoController.syncCarrito);
router.delete("/:sessionId", carritoController.vaciarCarrito);

export default router;
