import {
  defineConfig
} from "../../chunk-UFNFSJJH.mjs";
import "../../chunk-A4Z5FHJ7.mjs";
import "../../chunk-ZYFXLFUA.mjs";
import "../../chunk-C3UYDWPB.mjs";
import "../../chunk-CLUSUH55.mjs";
import {
  init_esm
} from "../../chunk-2MFC7V6J.mjs";

// trigger.config.ts
init_esm();
var project = process.env.TRIGGER_PROJECT_REF;
var apiUrl = process.env.TRIGGER_API_URL;
if (!project) {
  throw new Error(
    "TRIGGER_PROJECT_REF is required to run or deploy Tourna Trigger.dev tasks. Use tourna-local for local self-hosted development."
  );
}
if (!apiUrl) {
  throw new Error(
    "TRIGGER_API_URL is required so Tourna tasks target the self-hosted Trigger.dev instance. Local default is http://localhost:8030."
  );
}
if (apiUrl.includes("api.trigger.dev")) {
  throw new Error("Tourna Trigger.dev tasks must target the self-hosted API, not Trigger.dev Cloud.");
}
var trigger_config_default = defineConfig({
  project,
  dirs: ["./trigger"],
  tsconfig: "./tsconfig.json",
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 3e4,
      factor: 2,
      randomize: true
    }
  },
  machine: "small-1x",
  maxDuration: 30 * 60,
  ttl: "1h",
  enableConsoleLogging: process.env.NODE_ENV !== "production",
  build: {}
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map
