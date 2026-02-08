import fs from "fs";
import path from "path";

// ==================================================
// DIRETÓRIO BASE
// ==================================================

const BASE_DIR = path.resolve("data");

// ==================================================
// GARANTE ESTRUTURA DE PASTAS E ARQUIVOS
// ==================================================

function ensureBaseStructure() {
  // Pastas obrigatórias
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

  // Arquivos obrigatórios
  const files = [
    "users.json",
    "vip.json",
    "payments.json",
    "logins.json" // 🔑 usado no login Steam sem sessão
  ];

  for (const file of files) {
    const filePath = path.join(BASE_DIR, file);

    if (!fs.existsSync(filePath)) {
      const initialContent =
        file === "payments.json" ? [] : {};

      fs.writeFileSync(
        filePath,
        JSON.stringify(initialContent, null, 2)
      );
    }
  }
}

// ==================================================
// LOAD
// ==================================================

export function load(file) {
  ensureBaseStructure();

  const filePath = path.join(BASE_DIR, file);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${file}`);
  }

  const content = fs.readFileSync(filePath, "utf-8");

  return JSON.parse(content);
}

// ==================================================
// SAVE
// ==================================================

export function save(file, data) {
  ensureBaseStructure();

  const filePath = path.join(BASE_DIR, file);

  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2)
  );
}
