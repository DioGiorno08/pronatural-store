import mongoose from "mongoose";
import { config } from "./config.js";
import clientesModel from "./src/models/Clientes.js";

async function testSave() {
    await mongoose.connect(config.db.URI, { family: 4 });
    const email = "20230453@ricaldone.edu.sv";
    
    const user = await clientesModel.findOne({ email: email });
    if (user) {
        user.loginAttemps = 0;
        user.timeOut = null;
        try {
            await user.save();
            console.log("Save successful!");
        } catch (e) {
            console.log("Save failed:", e);
        }
    }
    process.exit(0);
}
testSave();
