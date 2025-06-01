import { FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import { FreGenericParser } from "../../utils/index.js";
import { ScopeDef, ScoperChecker } from "../metalanguage/index.js";
// import { setCurrentFileName } from "./ScoperCreators";
import { setCurrentFileName as expressionFileName } from "../../languagedef/parser/ExpressionCreators.js";

import { parser } from "./ScoperGrammar.js";

export class ScoperParser extends FreGenericParser<ScopeDef> {
    public language: FreMetaLanguage;

    constructor(language: FreMetaLanguage) {
        super();
        this.parser = parser;
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
        // setCurrentFileName(file);
        expressionFileName(file);
    }

    protected getNonFatalParseErrors(): string[] {
        return [];
    }
}
