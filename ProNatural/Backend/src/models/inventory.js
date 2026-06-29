import { Schema, model } from "mongoose";

const inventorySchema = new Schema({
    product_id: { type: Schema.Types.ObjectId, ref: 'products', required: true },
    type: { type: String, enum: ['IN', 'OUT'], required: true },
    quantity: { type: Number, required: true },
    reason: { type: String }
}, {
    timestamps: true,
    strict: false
});

export default model("inventory", inventorySchema);
