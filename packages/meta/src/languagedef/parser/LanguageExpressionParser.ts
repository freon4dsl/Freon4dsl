import { PiLanguage } from "../metalanguage/PiLanguage";
import { PiLangExpressionChecker } from "../checking/PiLangExpressionChecker";
import { PiParser } from "../../utils/parsingAndChecking/PiParser";
import { LanguageExpressionTester } from "./LanguageExpressionTester";
const pegjsParser = require("./ExpressionGrammar");
import { setCurrentFileName } from "./ExpressionCreators";

export class LanguageExpressionParser extends PiParser<LanguageExpressionTester> {
    public language: PiLanguage;

    constructor(language: PiLanguage) {
        super();
        this.parser = pegjsParser;
        this.language = language;
        this.checker = new PiLangExpressionChecker(this.language);
    }

    protected merge(submodels: LanguageExpressionTester[]): LanguageExpressionTester {
        // no need to merge submodels, LanguageExpressionTester is only used for tests
        return null;
    }

    protected setCurrentFileName(file: string) {
        setCurrentFileName(file);
    }

    protected getNonFatalParseErrors(): string[] {
        return [];
    }
}
