import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const buildDir = path.join(repoRoot, ".site-build");
const rootAssetsDir = path.join(repoRoot, "assets");
const buildAssetsDir = path.join(buildDir, "assets");
const docsDir = path.join(repoRoot, "docs");

fs.rmSync(rootAssetsDir, { recursive: true, force: true });
fs.cpSync(buildAssetsDir, rootAssetsDir, { recursive: true });
fs.copyFileSync(path.join(buildDir, "index.html"), path.join(repoRoot, "index.html"));
fs.copyFileSync(path.join(buildDir, "index.html"), path.join(repoRoot, "404.html"));

fs.rmSync(docsDir, { recursive: true, force: true });
fs.mkdirSync(docsDir, { recursive: true });
fs.cpSync(buildAssetsDir, path.join(docsDir, "assets"), { recursive: true });
fs.copyFileSync(path.join(buildDir, "index.html"), path.join(docsDir, "index.html"));
