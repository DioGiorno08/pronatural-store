/*
  Modelo: categories
  Campos:
    name        - Nombre de la categoría
    description - Descripción de la categoría
    isActive    - Estado activo/inactivo
*/

import { Schema, model } from "mongoose";

const categoriesSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    descripcion: {
      type: String,
    },
    tipo: { type: String },
    cantidad: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default model("Categorias", categoriesSchema, "Categorias");
