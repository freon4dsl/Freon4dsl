import { FreLanguage } from "../metalanguage/FreLanguage";
import { FreLangExpressionChecker } from "../checking/FreLangExpressionChecker";
import { PiParser } from "../../utils/parsingAndChecking/PiParser";
import { LanguageExpressionTester } from "./LanguageExpressionTester";
const pegjsParser = require("./ExpressionGrammar");
import { setCurrentFileName } from "./ExpressionCreators";

export class LanguageExpressionParser extends PiParser<LanguageExpressionTester> {
    public language: FreLanguage;

    constructor(language: FreLanguage) {
        super();
        this.parser = pegjsParser;
        this.language = language;
        this.checker = new FreLangExpressionChecker(this.language);
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
