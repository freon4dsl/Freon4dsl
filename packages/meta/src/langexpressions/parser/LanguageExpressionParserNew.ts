import { parse } from "./ExpressionGrammar.js";
import { setCurrentFileName } from "./ExpressionCreators.js";
import { FreGenericParserNew } from '../../utils/parsingAndChecking/FreGenericParserNew.js';
import { LanguageExpressionTesterNew } from './LanguageExpressionTesterNew.js';
import { FreMetaLanguage } from '../../languagedef/metalanguage/index.js';
import { FreLangExpressionCheckerNew } from '../checking/FreLangExpressionCheckerNew.js';

export class LanguageExpressionParserNew extends FreGenericParserNew<LanguageExpressionTesterNew> {
    public language: FreMetaLanguage;

    constructor(language: FreMetaLanguage) {
        super();
        this.parseFunction = parse;
        this.language = language;
        this.checker = new FreLangExpressionCheckerNew(this.language);
    }

    // @ts-ignore
    // error TS6133: 'submodels' is declared but its value is never read.
    // This error is ignored because this class is only used for tests.
    protected merge(submodels: LanguageExpressionTester[]): LanguageExpressionTester | undefined {
        // no need to merge submodels, LanguageExpressionTester is only used for tests
        return undefined;
    }

    protected setCurrentFileName(file: string) {
        setCurrentFileName(file);
    }

    protected getNonFatalParseErrors(): string[] {
        return [];
    }

    protected cleanNonFatalParseErrors() {}
}
