import { PiLanguage } from "../metalanguage/PiLanguage";
import { PiLanguageChecker } from "../metalanguage/PiLanguageChecker";
import { PiParser } from "../../utils/PiParser";
let pegjsParser = require("./LanguageGrammar");

export class LanguageParser extends PiParser<PiLanguage> {
    constructor() {
        super();
        this.parser = pegjsParser;
        this.checker = new PiLanguageChecker(null);
    }
}
