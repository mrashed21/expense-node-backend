import { register } from "tsconfig-paths";
import path from "path";

register({
  baseUrl: path.join(__dirname, ".."),
  paths: {
    "@/*": ["src/*"],
  },
});

import app from "../src/app";

export default app;
