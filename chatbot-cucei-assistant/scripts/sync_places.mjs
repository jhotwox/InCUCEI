import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { PLACES } from "../../server/src/constants/places.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outPath = path.resolve(__dirname, "../data/places.json");

fs.writeFileSync(outPath, JSON.stringify(PLACES, null, 2) + "\n", "utf-8");
console.log(`Wrote ${PLACES.length} places to ${outPath}`);
