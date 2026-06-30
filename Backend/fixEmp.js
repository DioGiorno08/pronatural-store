import mongoose from "mongoose";
import { config } from "./config.js";
import empleadosModel from "./src/models/Empleados.js";
import bcrypt from "bcryptjs";

async function fix() {
    await mongoose.connect(config.db.URI, { family: 4 });
    const email = "20230453@ricaldone.edu.sv";
    
    const emp = await empleadosModel.findOne({ correo: new RegExp('^' + email + '$', 'i') });
    if (emp) {
        console.log("Empleado found, updating password to Palomamami01!");
        emp.contraseña = await bcrypt.hash("Palomamami01!", 10);
        await emp.save();
        console.log("Done");
    } else {
        console.log("No empleado found.");
    }
    
    process.exit(0);
}
fix();
