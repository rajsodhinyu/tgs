import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  {
    extends: [...nextCoreWebVitals],
  },
  {
    // react-hooks v6 (React Compiler-era) rules new to eslint-config-next 16.
    // The p5 background sketches intentionally read audio-tap refs during
    // render; downgraded to warn rather than refactoring the pattern.
    rules: {
      "react-hooks/refs": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
    },
  },
]);
