import * as fs from "fs";
import { STYLES_ORIGIN } from "../../../utils";

const constFile = STYLES_ORIGIN + "/styles.ts";
const cssFile = STYLES_ORIGIN + "/style.scss";

export class StylesTemplate {

    generateConst(): string {
        return fs.readFileSync(constFile, { encoding: "UTF8" });
    }

    generateSCSS() {
        return fs.readFileSync(cssFile, { encoding: "UTF8" });
    }
}
