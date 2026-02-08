import fs from "fs";
import path from "path";

const BASE_DIR = path.resolve("data");

// ===============================
// GARANTE ESTRUTURA DE PASTAS
// ===============================

function ensureBaseStructure() {
  const folders = [
    BASE_DIR,
    path.join(BASE_DIR, "sessions"),
    path.join(BASE_DIR, "logs"),
    path.join(BASE_DIR, "backups")
  ];

  for (const folder of folders) {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  const files = [
    "users.json",
    "vip.json",
    "payments.json"
  ];

  for (const file of files) {
    const filePath = path.join(BASE_DIR, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, file === "payments.json" ? "[]" : "{}");
    }
  }
}

// ===============================
// LOAD / SAVE
// ===============================

export function load(file) {
  ensureBaseStructure();

  const filePath = path.join(BASE_DIR, file);
  const content = fs.readFileSync(filePath, "utf-8");

  return JSON.parse(content);
}

export function save(file, data) {
  ensureBaseStructure();

  const filePath = path.join(BASE_DIR, file);
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2)
  );
}
