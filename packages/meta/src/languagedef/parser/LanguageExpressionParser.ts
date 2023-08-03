import { FreMetaLanguage } from "../metalanguage/FreMetaLanguage";
import { FreLangExpressionChecker } from "../checking/FreLangExpressionChecker";
import { FreGenericParser } from "../../utils/parsingAndChecking/FreGenericParser";
import { LanguageExpressionTester } from "./LanguageExpressionTester";
const pegjsParser = require("./ExpressionGrammar");
import { setCurrentFileName } from "./ExpressionCreators";

export class LanguageExpressionParser extends FreGenericParser<LanguageExpressionTester> {
    public language: FreMetaLanguage;

    constructor(language: FreMetaLanguage) {
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
