import * as fs from "fs";
import { RESERVED_WORDS_ORIGIN } from "../../../utils";

const constFile = RESERVED_WORDS_ORIGIN + "/ReservedWords.ts";

export class ReservedWordsTemplate {

    generateConst() : string {
        return fs.readFileSync(constFile, { encoding: "UTF8" });
    }

}
