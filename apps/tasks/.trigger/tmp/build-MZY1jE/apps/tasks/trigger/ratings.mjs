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

// trigger/ratings.ts
init_esm();
var import_tasks = __toESM(require_dist());

// src/handlers/ratings.ts
init_esm();
function recalculateTournamentRatings(payload) {
  logger.info("Ratings recalculation task accepted", {
    tournamentId: payload.tournamentId,
    reason: payload.reason
  });
}
__name(recalculateTournamentRatings, "recalculateTournamentRatings");

// trigger/ratings.ts
var recalculateTournamentRatingsTriggerTask = schemaTask({
  id: import_tasks.recalculateTournamentRatingsTask.id,
  schema: import_tasks.recalculateTournamentRatingsPayloadSchema,
  retry: import_tasks.recalculateTournamentRatingsTask.retry,
  queue: import_tasks.recalculateTournamentRatingsTask.queue,
  maxDuration: import_tasks.recalculateTournamentRatingsTask.maxDuration,
  machine: import_tasks.recalculateTournamentRatingsTask.machine,
  run: /* @__PURE__ */ __name(async (payload) => {
    await Promise.resolve(recalculateTournamentRatings(payload));
  }, "run")
});
export {
  recalculateTournamentRatingsTriggerTask
};
//# sourceMappingURL=ratings.mjs.map
