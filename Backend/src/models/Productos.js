import { Schema, model } from "mongoose";

const productsSchema = new Schema({
    nombreProducto: { type: String },
    descripcion: { type: String },
    precio: { type: Number },
    stock: { type: Number },
    idCategoria: { type: String },
    imagenProducto: { type: [String] },
    estado: { type: String, default: "Disponible" },
    fechaVencimiento: { type: String }
}, {
    timestamps: true,
    strict: false
});

export default model("Productos", productsSchema, "Productos");