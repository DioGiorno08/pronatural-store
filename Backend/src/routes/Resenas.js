import express from "express";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";
import reviewsController from "../controllers/ResenasController.js";

const router = express.Router();

router
  .route("/")
  .get(reviewsController.getReviews)
  .post(reviewsController.createReview);

router
  .route("/:id")
  .delete(validateAuthCookie(["Admin", "Employee"]), reviewsController.deleteReview);

export default router;
