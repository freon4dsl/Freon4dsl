import { PiLanguageUnit } from "../../languagedef/metalanguage";
import { PiParser } from "../../utils";
import { PiScopeDef, PiScoperChecker } from "../metalanguage";

let scoperParser = require("./ScoperGrammar");

export class ScoperParser extends PiParser<PiScopeDef> {
    public language: PiLanguageUnit;

    constructor(language : PiLanguageUnit) {
        super();
        this.parser = scoperParser;
        this.msg = "Scoper";
        this.language = language;
        this.checker = new PiScoperChecker(language);
    }
}
