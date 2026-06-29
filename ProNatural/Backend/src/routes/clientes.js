import express from "express";
import clientesController from "../controllers/clientesController.js";

//usamos Router() de la libreria express para
//definir los métodos HTTP a utilizar
const router = express.Router();

router.route("/")
    .get(clientesController.getClientes)
    .post(clientesController.createCliente);

router.route("/:id")
    .put(clientesController.updateClientes)
    .delete(clientesController.deleteClientes);
export default router;