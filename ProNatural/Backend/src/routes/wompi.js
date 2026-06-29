import express from "express";
import wompiController from "../controllers/wompiController.js";

const router = express.Router();

// Generar token (público para checkout de invitados)
router
  .route("/token")
  .post(wompiController.generarToken);

// Transacción de prueba sin 3DS
router
  .route("/paymentTest")
  .post(wompiController.paymentTest);

// Transacción real con 3DS
router
  .route("/payment3DS")
  .post(wompiController.payment3DS);

// Consultar estado de una transacción por su ID
router
  .route("/transaction/:transactionId")
  .get(wompiController.getTransactionStatus);

// Webhook de Wompi — sin cookie porque lo llama Wompi directamente
// La autenticidad se valida por firma HMAC dentro del controlador
router.route("/webhook").post(wompiController.webhook);

export default router;
