import mongoose from "mongoose";
import { config } from "./config.js";
import usersModel from "./src/models/Usuarios.js";
import clientesModel from "./src/models/Clientes.js";

async function check() {
    await mongoose.connect(config.db.URI, { family: 4 });
    const email = "20230453@ricaldone.edu.sv";
    
    const admin = await usersModel.findOne({ correo: email });
    const cliente = await clientesModel.findOne({ email: email }) || await clientesModel.findOne({ correo: email });
    
    console.log("Admin:", admin ? "YES - Pass: " + admin.contraseña : "NO");
    console.log("Cliente:", cliente ? "YES - Pass: " + (cliente.password || cliente.contraseña) : "NO");
    process.exit(0);
}
check();
