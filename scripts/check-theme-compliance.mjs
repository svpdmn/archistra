import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ROOT_HTML_REQUIRED_MARKERS = [
  "dataset.themeMode",
  "dataset.theme",
  "scripts/theme-mode.js",
  "id=\"particles\"",
  "scripts/app.js"
];
const NEXT_LAYOUT_REQUIRED_MARKERS = [
  "archistra-theme-mode",
  "dataset.themeMode",
  "dataset.theme",
  "AmbientParticles"
];
const NEXT_NAV_REQUIRED_MARKERS = ["ThemeToggle"];
const STATIC_NAV_REQUIRED_MARKERS = [
  "theme-toggle-desktop",
  "theme-toggle-mobile",
  "bindToggle"
];

const SCAN_EXTENSIONS = new Set([".html", ".css", ".js", ".jsx", ".ts", ".tsx"]);
const CLASS_SCAN_EXTENSIONS = new Set([".html", ".js", ".jsx", ".ts", ".tsx"]);

const ALLOWED_COLOR_LITERAL_FILES = new Set([
  "styles/theme.css",
  "scripts/tailwind-theme.js",
  "scripts/theme-mode.js"
]);
const FORBIDDEN_THEME_CLASS_ALLOWLIST = new Set([
  "scripts/check-theme-compliance.mjs"
]);

const COLOR_LITERAL_PATTERN =
  /#[0-9a-fA-F]{3,8}\b|\brgba?\(\s*\d[\d\s.,%/]*\)|\bhsla?\(\s*\d[\d\s.,%/]*\)/g;
const FORBIDDEN_THEME_CLASS_PATTERN =
  /\b(?:text|bg|border|from|to)-(?:white|black)(?:\/\d{1,3})?\b/g;

function normalizePath(relativePath) {
  return relativePath.split(path.sep).join("/");
}

async function listRootHtmlFiles() {
  const entries = await readdir(ROOT, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name)
    .sort();
}

async function walkDirectory(relativeDir, bucket) {
  const absoluteDir = path.join(ROOT, relativeDir);
  let entries = [];

  try {
    entries = await readdir(absoluteDir, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }

  for (const entry of entries) {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      await walkDirectory(relativePath, bucket);
      continue;
    }
    if (!entry.isFile()) continue;
    const extension = path.extname(entry.name);
    if (!SCAN_EXTENSIONS.has(extension)) continue;
    bucket.push(relativePath);
  }
}

async function collectThemeCheckTargets() {
  const files = [];
  for (const dir of ["app", "components", "scripts", "styles"]) {
    await walkDirectory(dir, files);
  }
  for (const htmlFile of await listRootHtmlFiles()) {
    files.push(htmlFile);
  }
  return files;
}

function formatPreview(matches) {
  return matches
    .slice(0, 3)
    .map((match) => match.trim())
    .join(", ");
}

async function ensureFileContainsMarkers(relativePath, markers, failures) {
  const absolutePath = path.join(ROOT, relativePath);
  let content = "";

  try {
    content = await readFile(absolutePath, "utf8");
  } catch (error) {
    failures.push(`${relativePath}: file missing (${String(error)})`);
    return;
  }

  for (const marker of markers) {
    if (!content.includes(marker)) {
      failures.push(`${relativePath}: missing required marker "${marker}"`);
    }
  }
}

async function main() {
  const failures = [];
  const rootHtmlFiles = await listRootHtmlFiles();

  for (const htmlFile of rootHtmlFiles) {
    await ensureFileContainsMarkers(htmlFile, ROOT_HTML_REQUIRED_MARKERS, failures);
  }

  await ensureFileContainsMarkers("app/layout.tsx", NEXT_LAYOUT_REQUIRED_MARKERS, failures);
  await ensureFileContainsMarkers("components/nav/site-nav.tsx", NEXT_NAV_REQUIRED_MARKERS, failures);
  await ensureFileContainsMarkers("scripts/navbar.js", STATIC_NAV_REQUIRED_MARKERS, failures);

  const scanTargets = await collectThemeCheckTargets();
  for (const target of scanTargets) {
    const normalizedTarget = normalizePath(target);
    const content = await readFile(path.join(ROOT, target), "utf8");
    const extension = path.extname(target);

    if (!ALLOWED_COLOR_LITERAL_FILES.has(normalizedTarget)) {
      const literalMatches = Array.from(content.matchAll(COLOR_LITERAL_PATTERN)).map(
        (match) => match[0]
      );
      if (literalMatches.length > 0) {
        failures.push(
          `${normalizedTarget}: contains hardcoded color literals (${formatPreview(
            literalMatches
          )})`
        );
      }
    }

    if (
      CLASS_SCAN_EXTENSIONS.has(extension) &&
      !FORBIDDEN_THEME_CLASS_ALLOWLIST.has(normalizedTarget)
    ) {
      const classMatches = Array.from(content.matchAll(FORBIDDEN_THEME_CLASS_PATTERN)).map(
        (match) => match[0]
      );
      if (classMatches.length > 0) {
        failures.push(
          `${normalizedTarget}: contains hardcoded light/dark utility classes (${formatPreview(
            classMatches
          )})`
        );
      }
    }
  }

  if (failures.length > 0) {
    console.error("theme_compliance_failed");
    for (const failure of failures) {
      console.error(` - ${failure}`);
    }
    process.exit(1);
  }

  console.log("theme_compliance_ok");
}

main().catch((error) => {
  console.error("theme_compliance_exception", error);
  process.exit(1);
});
