import mongoose from "mongoose";
import { config } from "./config.js";
import clientesModel from "./src/models/Clientes.js";

async function check() {
    await mongoose.connect(config.db.URI, { family: 4 });
    const email = "20230453@ricaldone.edu.sv";
    
    const clientes = await clientesModel.find({ email: email });
    console.log("Total records found:", clientes.length);
    clientes.forEach((c, i) => {
        console.log(`Record ${i}: Pass: ${c.password}`);
    });
    process.exit(0);
}
check();
