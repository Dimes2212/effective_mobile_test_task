import http from "http";
import { app } from "./index";

const MAX_HEAP_MB = 700;

process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled Rejection:", reason);
  process.exit(1);
});

setInterval(() => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  if (used > MAX_HEAP_MB) {
    console.error(`[MEMORY ALERT] Heap usage ${Math.round(used)} MB`);
  }
}, 10000);

export function startServer(port = 0) {
  return new Promise<http.Server>((resolve) => {
    const server = app.listen(port, () => resolve(server));
  });
}
