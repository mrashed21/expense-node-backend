import { Schema, model } from "mongoose";
import { ISavedFilterDocument } from "./saved-filter.interface";

const savedFilterSchema = new Schema<ISavedFilterDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["transaction", "account", "category"],
      required: true,
    },
    filter_payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const SavedFilter = model<ISavedFilterDocument>(
  "SavedFilter",
  savedFilterSchema,
);
