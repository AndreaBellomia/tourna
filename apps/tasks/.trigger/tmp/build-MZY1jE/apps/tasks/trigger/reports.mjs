import {
  require_dist
} from "../../../chunk-7SPZSQOL.mjs";
import {
  schemaTask
} from "../../../chunk-UFNFSJJH.mjs";
import "../../../chunk-A4Z5FHJ7.mjs";
import "../../../chunk-ZYFXLFUA.mjs";
import {
  logger
} from "../../../chunk-C3UYDWPB.mjs";
import "../../../chunk-CLUSUH55.mjs";
import {
  __name,
  __toESM,
  init_esm
} from "../../../chunk-2MFC7V6J.mjs";

// trigger/reports.ts
init_esm();
var import_tasks = __toESM(require_dist());

// src/handlers/reports.ts
init_esm();
function generateTournamentReport(payload) {
  logger.info("Tournament report task accepted", {
    tournamentId: payload.tournamentId,
    format: payload.format,
    requestedByUserId: payload.requestedByUserId
  });
}
__name(generateTournamentReport, "generateTournamentReport");

// trigger/reports.ts
var generateTournamentReportTriggerTask = schemaTask({
  id: import_tasks.generateTournamentReportTask.id,
  schema: import_tasks.generateTournamentReportPayloadSchema,
  retry: import_tasks.generateTournamentReportTask.retry,
  queue: import_tasks.generateTournamentReportTask.queue,
  maxDuration: import_tasks.generateTournamentReportTask.maxDuration,
  machine: import_tasks.generateTournamentReportTask.machine,
  run: /* @__PURE__ */ __name(async (payload) => {
    await Promise.resolve(generateTournamentReport(payload));
  }, "run")
});
export {
  generateTournamentReportTriggerTask
};
//# sourceMappingURL=reports.mjs.map
