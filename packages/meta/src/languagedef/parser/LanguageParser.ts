import { PiLanguageUnit } from "../metalanguage/PiLanguage";
import { PiLanguageChecker } from "../metalanguage/PiLanguageChecker";
import { PiParser } from "../../utils/PiParser";
let pegjsParser = require("./LanguageGrammar");

export class LanguageParser extends PiParser<PiLanguageUnit> {

    constructor() {
        super();
        this.parser = pegjsParser;
        this.msg = "Language";
        this.checker = new PiLanguageChecker();
    }
}
