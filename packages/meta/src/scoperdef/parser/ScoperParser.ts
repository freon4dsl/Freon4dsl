import { PiLanguageUnit } from "../../languagedef/metalanguage";
import { PiParser } from "../../utils";
import { PiScopeDef, ScoperChecker } from "../metalanguage";

let scoperParser = require("./ScoperGrammar");

export class ScoperParser extends PiParser<PiScopeDef> {
    public language: PiLanguageUnit;

    constructor(language : PiLanguageUnit) {
        super();
        this.parser = scoperParser;
        this.language = language;
        this.checker = new ScoperChecker(language);
    }
}
