import * as fs from "fs";

const constFile = __dirname + "/styles/styles.ts";
const cssFile = __dirname + "/styles/style.scss";

export class StylesTemplate {

    generateConst(): string {
        return fs.readFileSync(constFile, { encoding: "UTF8" });
    }

    generateSCSS() {
        return fs.readFileSync(cssFile, { encoding: "UTF8" });
    }
}
