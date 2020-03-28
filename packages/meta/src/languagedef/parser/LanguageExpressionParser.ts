import { PiLanguageUnit } from "../metalanguage/PiLanguage";
import { PiLanguageExpressionChecker } from "../metalanguage/PiLanguageExpressionChecker";
import { PiParser } from "../../utils/PiParser";
import { LanguageExpressionTester } from "./LanguageExpressionTester";
let pegjsParser = require("./LanguageExpressionGrammar");

export class LanguageExpressionParser extends PiParser<LanguageExpressionTester> {
    public language: PiLanguageUnit;

    constructor(language : PiLanguageUnit) {
        super();
        this.parser = pegjsParser;
        this.msg = "Language Expressions";
        this.language = language;
        this.checker = new PiLanguageExpressionChecker(this.language);
    }
}
