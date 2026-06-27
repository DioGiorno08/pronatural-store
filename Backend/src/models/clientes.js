import { Schema, model } from "mongoose";

const clientesSchema = new Schema(
  {
    name: { type: String },
    lastName: { type: String },
    birthdate: { type: Date },
    email: { type: String },
    password: { type: String },
    isVerified: { type: Boolean },
    loginAttemps: { type: Number },
    timeOut: { type: Date },
  },
  {
    timestamps: true,
    strict: false,
  },
);

export default model("Clientes", clientesSchema);
