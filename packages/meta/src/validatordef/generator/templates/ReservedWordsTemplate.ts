import * as fs from "fs";

const constFile = import.meta.dirname + "/ReservedWords.ts";

export class ReservedWordsTemplate {

    generateConst(): string {
        return fs.readFileSync(constFile, { encoding: "utf8" });
    }

}
