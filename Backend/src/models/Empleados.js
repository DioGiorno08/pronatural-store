import mongoose from "mongoose";

const empleadosSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    cargo: { type: String, required: true },
    telefono: { type: String },
    correo: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
    salario: { type: Number, required: true },
    isVerified: { type: Boolean, default: false },
    firstLogin: { type: Boolean, default: true },
    loginAttemps: { type: Number, default: 0 },
    timeOut: { type: Date }
  },
  { versionKey: false, timestamps: false }
);

export default mongoose.model("Empleados", empleadosSchema, "Empleados");
