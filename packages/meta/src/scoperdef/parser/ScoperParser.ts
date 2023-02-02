import { FreLanguage } from "../../languagedef/metalanguage";
import { FreGenericParser } from "../../utils";
import { ScopeDef, ScoperChecker } from "../metalanguage";
import { setCurrentFileName } from "./ScoperCreators";
import { setCurrentFileName as expressionFileName } from "../../languagedef/parser/ExpressionCreators";

const scoperParser = require("./ScoperGrammar");

export class ScoperParser extends FreGenericParser<ScopeDef> {
    public language: FreLanguage;

    constructor(language: FreLanguage) {
        super();
        this.parser = scoperParser;
        this.language = language;
        this.checker = new ScoperChecker(language);
    }

    protected merge(submodels: ScopeDef[]): ScopeDef {
        if (submodels.length > 0) {
            let result: ScopeDef = submodels[0];
            submodels.forEach((sub, index) => {
                if (index > 0) {
                    result.namespaces.push(...sub.namespaces);
                    result.scopeConceptDefs.push(...sub.scopeConceptDefs);
                }
            });
            return result;
        } else {
            return null;
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
