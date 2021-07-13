import * as fs from "fs";

const constFile = __dirname + "/styles/styles.ts0";

export class StylesTemplate {

    generateConst(): string {
        return fs.readFileSync(constFile, { encoding: "utf8" });
    }

}
