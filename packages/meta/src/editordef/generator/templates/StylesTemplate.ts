import * as fs from "fs";
import { GenerationStatus, Helpers, STYLES_ORIGIN } from "../../../utils";
// import { PiLogger } from "@projectit/core";

const constFile = STYLES_ORIGIN + "/styles.ts";
const cssFile = STYLES_ORIGIN + "/style.scss";

// const LOGGER = new PiLogger("StylesTemplate"); //.mute();

export class StylesTemplate {

    generateConst() : string {
        return fs.readFileSync(constFile, { encoding: "UTF8" });
    }

    generateSCSS() {
        return fs.readFileSync(cssFile, { encoding: "UTF8" });
    }
}
