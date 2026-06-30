import { Schema, model } from "mongoose";

const usersSchema = new Schema({
    nombre: { type: String, required: true },
    apellido: { type: String },
    correo: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
    telefono: { type: String },
    isVerified: { type: Boolean, default: false },
    loginAttemps: { type: Number, default: 0 },
    timeOut: { type: Date }
}, {
    timestamps: true,
    strict: false
});

export default model("Admin", usersSchema, "Admin");
