import path from "path";
import { register } from "tsconfig-paths";

register({
  baseUrl: path.join(__dirname, ".."),
  paths: {
    "../src/*": ["src/*"],
  },
});

const app = require("../src/app").default;

export default app;
