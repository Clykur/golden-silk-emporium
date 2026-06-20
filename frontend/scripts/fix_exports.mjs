import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_DIR = path.join(__dirname, "../app");

function getPageFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getPageFiles(fullPath, files);
    } else if (file === "page.tsx") {
      files.push(fullPath);
    }
  }
  return files;
}

const pageFiles = getPageFiles(APP_DIR);

for (const file of pageFiles) {
  let content = fs.readFileSync(file, "utf8");
  if (content.includes("export default")) {
    continue;
  }

  // Find all functions declared in the file that start with a capital letter (typical React component)
  const matches = [...content.matchAll(/function\s+([A-Z][a-zA-Z0-9]*)\s*\(/g)];
  if (matches.length > 0) {
    const componentName = matches[0][1];
    console.log(
      `Fixing export in ${path.relative(APP_DIR, file)}: exporting ${componentName} as default`,
    );

    // Replace the function declaration with default export
    content = content.replace(
      new RegExp(`function\\s+${componentName}\\b`),
      `export default function ${componentName}`,
    );
    fs.writeFileSync(file, content, "utf8");
  } else {
    console.log(`No capitalized function found in ${path.relative(APP_DIR, file)}`);
  }
}
console.log("Export fixes complete!");
