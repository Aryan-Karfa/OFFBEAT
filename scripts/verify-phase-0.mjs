import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const root = process.cwd();

const required = [
  "Frontend",
  "Backend",
  "packages",
  "prisma",
  "DOCS",
  "package.json",
  "pnpm-workspace.yaml",
  "tsconfig.base.json",
  ".env.example",
  ".gitignore",
  "README.md",
];

const docs = [
  "API_SPECS.md",
  "BACKEND_FLOW.md",
  "DBD.md",
  "DEVELOPMENT_PHASES.md",
  "FOLDER_STRUCTURE.md",
  "MEMORY.md",
  "PRD.md",
  "SSD.md",
  "TRD.md",
  "UI_UX.md",
];

const failures = [];

for (const relativePath of required) {
  const target = join(root, relativePath);
  if (!existsSync(target)) {
    failures.push(`Missing: ${relativePath}`);
  }
}

for (const filename of docs) {
  const target = join(root, "DOCS", filename);
  if (!existsSync(target)) {
    failures.push(`Missing source-of-truth document: DOCS/${filename}`);
  }
}

for (const relativePath of required) {
  const target = join(root, relativePath);
  if (existsSync(target) && !statSync(target).isFile() && !statSync(target).isDirectory()) {
    failures.push(`Invalid filesystem entry: ${relativePath}`);
  }
}

if (failures.length > 0) {
  console.error("Phase 0 verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Phase 0 repository structure: OK");
console.log(
  `Verified ${required.length} root entries and ${docs.length} source-of-truth documents.`,
);
