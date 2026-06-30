import { Schema, model } from "mongoose";

const carritoSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true }, // Identificador temporal o del cliente
    productos: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Productos", required: true },
        quantity: { type: Number, required: true, min: 1 },
      }
    ],
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default model("Carrito", carritoSchema, "Carrito");
