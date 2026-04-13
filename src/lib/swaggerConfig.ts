import { readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

/**
 * Reads and parses the hand-crafted OpenAPI YAML spec at build / request time.
 * Using fs + js-yaml is more reliable than swagger-jsdoc for a standalone YAML
 * file (swagger-jsdoc expects JSDoc annotations, not raw spec files).
 *
 * js-yaml is a direct dependency of swagger-jsdoc so it is always present.
 */
function loadSpec(): object {
  const specPath = join(process.cwd(), "src", "docs", "openapi.yaml");
  const raw = readFileSync(specPath, "utf-8");
  return yaml.load(raw) as object;
}

// Cache the spec so it is parsed only once per server lifecycle.
let _cachedSpec: object | null = null;

export function getSwaggerSpec(): object {
  if (!_cachedSpec) {
    _cachedSpec = loadSpec();
  }
  return _cachedSpec;
}

// Keep the named export for any code that imported `swaggerSpec` previously.
export const swaggerSpec = getSwaggerSpec();
