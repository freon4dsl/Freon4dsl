import { PiScoperChecker } from "../metalanguage/PiScoperChecker";
import { PiParser } from "../../utils/PiParser";
import { PiLanguage } from "../../languagedef/metalanguage/PiLanguage";
import { PiScopeDef } from "../metalanguage/PiScopeDefLang";
let scoperParser = require("./ScoperGrammar");

export class ScoperParser extends PiParser<PiScopeDef> {
    public language: PiLanguage;

    constructor(language : PiLanguage) {
        super();
        this.parser = scoperParser;
        this.msg = "Scoper";
        this.language = language;
        this.checker = new PiScoperChecker(language);
    }
}
