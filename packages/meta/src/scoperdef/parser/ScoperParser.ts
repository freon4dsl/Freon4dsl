import { FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import { ScopeDef, ScoperChecker } from "../metalanguage/index.js";
import { setCurrentFileName } from "./ScoperCreators.js";
import { setCurrentFileName as expressionFileName } from "../../langexpressions/parser/ExpressionCreators.js";

import { parse } from "./ScoperGrammar.js";
import { FreGenericParserNew } from '../../utils/parsingAndChecking/FreGenericParserNew.js';

export class ScoperParser extends FreGenericParserNew<ScopeDef> {
    public language: FreMetaLanguage;

    constructor(language: FreMetaLanguage) {
        super();
        this.parseFunction = parse;
        this.language = language;
        this.checker = new ScoperChecker(language);
    }

    protected merge(submodels: ScopeDef[]): ScopeDef | undefined {
        console.log('ScoperParser merging submodels ');
        if (submodels.length > 0) {
            const result: ScopeDef = submodels[0];
            submodels.forEach((sub, index) => {
                if (index > 0) {
                    result.namespaces.push(...sub.namespaces);
                    result.scopeConceptDefs.push(...sub.scopeConceptDefs);
                }
            });
            return result;
        } else {
            return undefined;
        }
    }

    protected setCurrentFileName(file: string) {
        setCurrentFileName(file);
        expressionFileName(file);
    }

    protected getNonFatalParseErrors(): string[] {
        return [];
    }
}
