import mongoose from "mongoose";
import { config } from "./config.js";
import empleadosModel from "./src/models/Empleados.js";
import clientesModel from "./src/models/Clientes.js";

async function check() {
    await mongoose.connect(config.db.URI, { family: 4 });
    const email = "20230453@ricaldone.edu.sv";
    
    const emp = await empleadosModel.findOne({ correo: new RegExp('^' + email + '$', 'i') });
    console.log("Empleado:", emp ? "YES - Pass: " + emp.contraseña : "NO");
    const cli = await clientesModel.findOne({ email: new RegExp('^' + email + '$', 'i') });
    console.log("Cliente:", cli ? "YES - Pass: " + cli.password : "NO");
    
    process.exit(0);
}
check();
