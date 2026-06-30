/*
  Modelo: Ventas
*/

import mongoose, { Schema, model } from "mongoose";

const salesSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Clientes",
      default: null
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Empleados",
      default: null
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Productos"
        },
        quantity: Number,
        unitPrice: Number,
        subtotal: Number
      }
    ],
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "cash",
    },
    status: {
      type: String,
      default: "completed"
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default model("Ventas", salesSchema, "Ventas");
