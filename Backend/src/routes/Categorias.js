import express from "express";
import categoriesController from "../controllers/CategoriasController.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Solo Admin puede crear, editar o eliminar categorías
// GET activas disponible para Customer también (para el storefront)
router
  .route("/")
  .get(categoriesController.getCategories)
  .post(
    validateAuthCookie(["Admin"]),
    categoriesController.insertCategory
  );

// Ruta pública: categorías activas (para mostrar en tienda)
router
  .route("/active")
  .get(
    validateAuthCookie(["Admin", "Customer"]),
    categoriesController.getActiveCategories
  );

router
  .route("/:id")
  .get(validateAuthCookie(["Admin"]), categoriesController.getCategoryById)
  .put(validateAuthCookie(["Admin"]), categoriesController.updateCategory)
  .delete(validateAuthCookie(["Admin"]), categoriesController.deleteCategory);

// Activar / desactivar sin eliminar
router
  .route("/:id/toggle")
  .patch(validateAuthCookie(["Admin"]), categoriesController.toggleCategory);

export default router;
