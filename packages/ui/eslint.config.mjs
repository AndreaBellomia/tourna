import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "@repo/eslint-config/react-internal";

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config} */
export default config(tsconfigRootDir);
