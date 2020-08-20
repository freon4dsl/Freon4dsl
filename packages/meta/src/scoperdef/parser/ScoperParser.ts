import { PiLanguage } from "../../languagedef/metalanguage";
import { PiParser } from "../../utils";
import { PiScopeDef, ScoperChecker } from "../metalanguage";

const scoperParser = require("./ScoperGrammar");

export class ScoperParser extends PiParser<PiScopeDef> {
    public language: PiLanguage;

    constructor(language: PiLanguage) {
        super();
        this.parser = scoperParser;
        this.language = language;
        this.checker = new ScoperChecker(language);
    }
}
