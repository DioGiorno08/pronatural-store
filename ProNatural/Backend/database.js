import mongoose from "mongoose";
import { config } from "./config.js";

mongoose.connect(config.db.URI, { 
    family: 4 // Force IPv4 to prevent Node.js DNS SRV resolution issues 
});

const connection = mongoose.connection;
connection.once("open", () => console.log("DB is connected"));
connection.on("error", (e) => console.log("error" + e));