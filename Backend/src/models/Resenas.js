import { Schema, model } from "mongoose";

const reviewsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: "approved",
      enum: ["approved", "pending"],
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Reviews", reviewsSchema);
