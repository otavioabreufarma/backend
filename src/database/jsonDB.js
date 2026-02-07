import fs from "fs-extra";
import path from "path";

const dataPath = path.resolve("data");

export function load(file) {
  const filePath = path.join(dataPath, file);
  if (!fs.existsSync(filePath)) return file.endsWith(".json") ? {} : [];
  return fs.readJsonSync(filePath);
}

export function save(file, data) {
  const filePath = path.join(dataPath, file);
  fs.writeJsonSync(filePath, data, { spaces: 2 });
}
