import fs from "fs";
import path from "path";

const logDir = path.resolve("data/logs");

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

export function log(event, payload) {
  const file = path.join(logDir, `${event}.log`);
  const line = `[${new Date().toISOString()}] ${JSON.stringify(payload)}\n`;
  fs.appendFileSync(file, line);
}
