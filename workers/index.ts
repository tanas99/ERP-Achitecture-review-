/**
 * Background worker entrypoint (ARCHITECTURE.md §20). In later milestones this
 * process drains the pg-boss queue (notifications, media processing, SRI
 * generation, search reindex). For the Foundation it is a placeholder so the
 * two-process deployment shape (web + worker) exists from day one.
 */
async function main() {
  console.log("[worker] started — no jobs registered yet (Foundation).");
}

main().catch((err) => {
  console.error("[worker] fatal", err);
  process.exit(1);
});
