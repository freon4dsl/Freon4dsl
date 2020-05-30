import { PiLanguageUnit } from "../metalanguage/PiLanguage";
import { PiLangExpressionChecker } from "../metalanguage/PiLangExpressionChecker";
import { PiParser } from "../../utils/PiParser";
import { LanguageExpressionTester } from "./LanguageExpressionTester";
let pegjsParser = require("./ExpressionGrammar");

export class LanguageExpressionParser extends PiParser<LanguageExpressionTester> {
    public language: PiLanguageUnit;

    constructor(language: PiLanguageUnit) {
        super();
        this.parser = pegjsParser;
        this.language = language;
        this.checker = new PiLangExpressionChecker(this.language);
    }
}
