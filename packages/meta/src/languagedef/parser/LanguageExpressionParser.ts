import { PiLanguage } from "../metalanguage/PiLanguage";
import { PiLangExpressionChecker } from "../metalanguage/PiLangExpressionChecker";
import { PiParser } from "../../utils/PiParser";
import { LanguageExpressionTester } from "./LanguageExpressionTester";
const pegjsParser = require("./ExpressionGrammar");

export class LanguageExpressionParser extends PiParser<LanguageExpressionTester> {
    public language: PiLanguage;

    constructor(language: PiLanguage) {
        super();
        this.parser = pegjsParser;
        this.language = language;
        this.checker = new PiLangExpressionChecker(this.language);
    }
}
