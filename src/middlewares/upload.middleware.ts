import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { envConfig } from "../config/env-config";

if (envConfig.cloudinary.cloud_name) {
  cloudinary.config({
    cloud_name: envConfig.cloudinary.cloud_name,
    api_key: envConfig.cloudinary.api_key,
    api_secret: envConfig.cloudinary.api_secret,
  });
}

let storage;

if (envConfig.cloudinary.cloud_name) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      return {
        folder: "expense-tracker/profiles",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      };
    },
  });
} else {
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
    },
  });
}

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
