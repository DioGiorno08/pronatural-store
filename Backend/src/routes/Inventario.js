import { Router } from "express";
import inventoryController from "../controllers/InventarioController.js";

const router = Router();

router.get("/", inventoryController.getInventory);
router.put("/:id", inventoryController.updateStock);
router.post("/:id/reorder", inventoryController.reorderProduct);

export default router;
