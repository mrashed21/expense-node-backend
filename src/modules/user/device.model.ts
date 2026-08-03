import { Schema, model } from "mongoose";
import { IDeviceDocument } from "./user.interface";

const deviceSchema = new Schema<IDeviceDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    device_id: {
      type: String,
      required: true,
    },
    device_name: {
      type: String,
      required: true,
    },
    is_trusted: {
      type: Boolean,
      default: false,
    },
    last_active: {
      type: Date,
      default: Date.now,
    },
    ip_address: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

deviceSchema.index({ user_id: 1, device_id: 1 }, { unique: true });

export const Device = model<IDeviceDocument>("Device", deviceSchema);
