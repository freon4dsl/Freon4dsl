import { PiScoperChecker } from "../../metalanguage/scoper/PiScoperChecker";
import { PiParser } from "../PiParser";
import { PiLanguage } from "../../metalanguage/PiLanguage";
import { PiScopeDef } from "../../metalanguage/scoper/PiScopeDefLang";
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
