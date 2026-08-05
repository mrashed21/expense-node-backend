import fs from "fs";
import path from "path";

const modulesDir = path.join(__dirname, "../src/modules");
const outputFile = path.join(__dirname, "../../docs/api-audit.md");

const methodColors = {
  get: "🟢 GET",
  post: "🔵 POST",
  patch: "🟠 PATCH",
  put: "🟠 PUT",
  delete: "🔴 DELETE",
};

let markdown = `# Backend API Audit (Sprint 02)\n\n`;
markdown += `This document contains the automated extraction of all backend APIs. The backend API serves as the single source of truth for both the Web and Mobile Flutter applications.\n\n`;
markdown += `## Standard Response Format\nAll APIs (unless otherwise specified) respond with the following JSON structure:\n\`\`\`json\n{\n  "success": true,\n  "statusCode": 200,\n  "message": "Operation successful",\n  "meta": { "page": 1, "limit": 10, "total": 50 }, // Optional for pagination\n  "data": {} // Actual payload\n}\n\`\`\`\n\n`;

markdown += `## Modules Overview\n\n`;

function parseRouteFile(filePath: string, moduleName: string) {
  const content = fs.readFileSync(filePath, "utf-8");

  // Extract global auth usage
  const usesGlobalAuth =
    content.includes("router.use(checkAuth())") ||
    content.includes("router.use(auth)");

  // Regex to find router methods
  // Matches: router.get('/path', middleware, controller)
  const routeRegex = /router\.(get|post|patch|put|delete)\(\s*(['"`].*?['"`])/g;

  let match;
  let routes = [];

  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1];
    const endpointPath = match[2].replace(/['"`]/g, ""); // Strip quotes

    // Attempt to extract the rest of the line/block for this route to check for validateRequest
    const startIndex = match.index;
    let endIndex = content.indexOf(");", startIndex);
    if (endIndex === -1) endIndex = startIndex + 100; // fallback
    const routeBlock = content.substring(startIndex, endIndex);

    let payload = "None";
    const validateMatch = routeBlock.match(
      /validateRequest\(\s*([a-zA-Z0-9_]+)\s*\)/,
    );
    if (validateMatch) {
      payload = validateMatch[1];
    }

    let isAuth =
      usesGlobalAuth ||
      routeBlock.includes("checkAuth()") ||
      routeBlock.includes("auth,") ||
      routeBlock.includes("auth ");

    routes.push({
      method: method,
      path: `/api/v1/${moduleName === "user" ? "users" : moduleName === "category" ? "categories" : moduleName + "s"}${endpointPath === "/" ? "" : endpointPath}`.replace(
        "ys",
        "ies",
      ), // Basic pluralization for display
      auth: isAuth ? "Yes 🔒" : "No 🔓",
      payload: payload,
    });
  }

  return routes;
}

const dirs = fs.readdirSync(modulesDir);
dirs.forEach((moduleName) => {
  const modulePath = path.join(modulesDir, moduleName);
  if (fs.statSync(modulePath).isDirectory()) {
    const routeFile = path.join(modulePath, `${moduleName}.route.ts`);
    if (fs.existsSync(routeFile)) {
      const routes = parseRouteFile(routeFile, moduleName);

      markdown += `### ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Module\n`;
      markdown += `| Method | Endpoint | Auth | Payload / Validation Schema |\n`;
      markdown += `|--------|----------|------|-----------------------------|\n`;

      if (routes.length === 0) {
        markdown += `| - | No routes found via automated extraction | - | - |\n`;
      } else {
        routes.forEach((route) => {
          markdown += `| ${methodColors[route.method as keyof typeof methodColors] || route.method.toUpperCase()} | \`${route.path}\` | ${route.auth} | \`${route.payload}\` |\n`;
        });
      }
      markdown += `\n`;
    }
  }
});

markdown += `## Inconsistent Responses & Missing APIs (Manual Review)\n`;
markdown += `- No major structural inconsistencies found (standard sendResponse wrapper is utilized across controllers).\n`;
markdown += `- Ensure all list endpoints correctly implement the \`meta\` pagination object.\n`;
markdown += `- *To be completed during manual verification by the mobile team!*\n`;

fs.writeFileSync(outputFile, markdown);
console.log(`API documentation generated successfully at ${outputFile}`);
