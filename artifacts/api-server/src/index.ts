import app from "./app";
import { logger } from "./lib/logger";

// Accept PORT from environment (required in Replit workflow; falls back to 5000
// for Render and other cloud hosts that may inject it differently).
const rawPort = process.env["PORT"];
const port = rawPort ? Number(rawPort) : 5000;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
