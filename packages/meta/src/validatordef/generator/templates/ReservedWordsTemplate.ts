import * as fs from "fs";

const constFile = __dirname + "/ReservedWords.ts";

export class ReservedWordsTemplate {

    generateConst(): string {
        return fs.readFileSync(constFile, { encoding: "UTF8" });
    }

}
