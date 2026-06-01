import { spawn } from "node:child_process";

const packageFilters = [
  "@repo/authorization",
  "@repo/contracts",
  "@repo/db",
  "@repo/domain",
  "@repo/email",
  "@repo/queue",
  "@repo/redis",
  "@repo/storage",
];

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const child = spawn(
  pnpm,
  [
    "exec",
    "turbo",
    "watch",
    "build",
    "--ui=stream",
    ...packageFilters.map((filter) => `--filter=${filter}`),
  ],
  {
    stdio: "inherit",
    shell: false,
  },
);

function shutdown(signal) {
  if (!child.killed) {
    child.kill(signal);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
