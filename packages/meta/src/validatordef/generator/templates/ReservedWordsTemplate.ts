import * as fs from "fs";
import path from 'node:path';

const constFile = import.meta.dirname + path.sep + "ReservedWords.js";

export class ReservedWordsTemplate {
    generateConst(): string {
        console.log("Generating ReservedWords...", constFile);
        return fs.readFileSync(constFile, { encoding: "utf8" });
    }
}
