import { Router } from "express";
import productsController from "../controllers/productsController.js";

const router = Router();

router.get("/", productsController.getProducts);
router.get("/:id", productsController.getProduct);
router.post("/", productsController.createProduct);
router.put("/:id", productsController.updateProduct);
router.delete("/:id", productsController.deleteProduct);

export default router;
