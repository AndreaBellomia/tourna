import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { nextJsConfig } from "@repo/eslint-config/next-js";

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config[]} */
export default nextJsConfig(tsconfigRootDir);
