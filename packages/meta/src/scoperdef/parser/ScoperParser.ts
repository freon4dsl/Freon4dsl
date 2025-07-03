import { FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import { ScopeDef, ScoperChecker } from "../metalanguage/index.js";
import { setCurrentFileName } from "./ScoperCreators.js";
import { setCurrentFileName as expressionFileName } from "../../langexpressions/parser/ExpressionCreators.js";

import { parse } from "./ScoperGrammar.js";
import { FreGenericParser } from '../../utils/basic-dependencies/FreGenericParser.js';

export class ScoperParser extends FreGenericParser<ScopeDef> {
    public language: FreMetaLanguage;

    constructor(language: FreMetaLanguage) {
        super();
        this.parseFunction = parse;
        this.language = language;
        this.checker = new ScoperChecker(language);
    }

    protected merge(submodels: ScopeDef[]): ScopeDef | undefined {
        if (submodels.length > 0) {
            const result: ScopeDef = submodels[0];
            submodels.forEach((sub, index) => {
                if (index > 0) {
                    // NB We cannot use 'sub.namespaces' here because the references have not been resolved yet.
                    result.namespaceRefs.push(...sub.namespaceRefs);
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
