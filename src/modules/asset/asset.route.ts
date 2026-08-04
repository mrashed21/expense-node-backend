import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validate-request";
import { AssetController } from "./asset.controller";
import { createAssetSchema, updateAssetSchema } from "./asset.validation";

const router = Router();

router.post(
  "/",
  auth,
  validateRequest(createAssetSchema),
  AssetController.createAsset
);

router.get("/", auth, AssetController.getAssets);

router.get("/:id", auth, AssetController.getAssetById);

router.patch(
  "/:id",
  auth,
  validateRequest(updateAssetSchema),
  AssetController.updateAsset
);

router.delete("/:id", auth, AssetController.deleteAsset);

router.patch("/:id/restore", auth, AssetController.restoreAsset);

export const AssetRoutes = router;
