// Extracts only the Hershey fonts the site uses from the hersheytext package (MIT) into src/engine/fonts.json.
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const { fonts } = require("hersheytext");
const keep = ["scriptc", "scripts", "futural", "timesi"];
const out = {};
for (const k of keep) out[k] = { name: fonts[k].name, chars: fonts[k].chars.map((c) => ({ d: c.d, o: c.o })) };
writeFileSync(new URL("../src/engine/fonts.json", import.meta.url), JSON.stringify(out));
console.log("wrote fonts:", keep.join(", "));
