import { z } from "zod";
import { AssetType } from "./asset.interface";

export const createAssetSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Asset name is required",
      })
      .min(1, "Asset name cannot be empty"),
    type: z.nativeEnum(AssetType, {
      required_error: "Asset type is required",
      invalid_type_error: "Invalid asset type",
    }),
    value: z
      .number({
        required_error: "Asset value is required",
      })
      .min(0, "Value cannot be negative"),
    purchase_price: z
      .number()
      .min(0, "Purchase price cannot be negative")
      .optional(),
    purchase_date: z.string().datetime().optional(),
    notes: z.string().optional(),
  }),
});

export const updateAssetSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Asset name cannot be empty").optional(),
    type: z
      .nativeEnum(AssetType, {
        invalid_type_error: "Invalid asset type",
      })
      .optional(),
    value: z.number().min(0, "Value cannot be negative").optional(),
    purchase_price: z
      .number()
      .min(0, "Purchase price cannot be negative")
      .optional()
      .nullable(),
    purchase_date: z.string().datetime().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});
