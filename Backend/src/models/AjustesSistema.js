import mongoose, { Schema, model } from "mongoose";

const ajustesSistemaSchema = new Schema(
  {
    storeName: { type: String, default: "Pro Natural" },
    ruc: { type: String, default: "" },
    email: { type: String, default: "info@pronatural.com" },
    phone: { type: String, default: "+503 2222-2222" },
    address: { type: String, default: "San Salvador, El Salvador" },
    website: { type: String, default: "https://pronatural.com" },
    whatsapp: { type: String, default: "50369674467" },
    mapUrl: { type: String, default: "" },

    instagram: { type: String, default: "@pronatural" },
    facebook: { type: String, default: "fb.com/pronatural" },
    tiktok: { type: String, default: "@pronatural" },
    youtube: { type: String, default: "youtube.com/@pronatural" },

    metas: {
      diaria: { type: Number, default: 150 },
      semanal: { type: Number, default: 1050 },
      mensual: { type: Number, default: 4500 }
    },

    notificaciones: {
      enabled: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      outOfStock: { type: Boolean, default: true }
    },

    reporteSemanal: {
      enabled: { type: Boolean, default: false },
      dia: { type: Number, default: 1 }, // 1 = Lunes
      hora: { type: Number, default: 8 } // 8 = 8 AM
    }
  },
  {
    timestamps: true,
  }
);

export default model("AjustesSistema", ajustesSistemaSchema, "AjustesSistema");
