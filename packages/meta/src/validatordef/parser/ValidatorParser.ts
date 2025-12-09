import type { FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import { FreGenericParser } from "../../utils/basic-dependencies/index.js";
import { ValidatorChecker } from "../metalanguage/index.js";
import type { ValidatorDef } from "../metalanguage/index.js";
import { setCurrentFileName } from "./ValidatorCreators.js";
import { setCurrentFileName as expressionFileName } from "../../langexpressions/parser/ExpressionCreators.js";
import { parse } from "./ValidatorGrammar.js";

export class ValidatorParser extends FreGenericParser<ValidatorDef> {
    public language: FreMetaLanguage;

    constructor(language: FreMetaLanguage) {
        super();
        this.parseFunction = parse;
        this.language = language;
        this.checker = new ValidatorChecker(language);
    }

    protected merge(submodels: ValidatorDef[]): ValidatorDef {
        if (submodels.length > 0) {
            const result: ValidatorDef = submodels[0];
            submodels.forEach((sub, index) => {
                if (index > 0) {
                    result.classifierRules.push(...sub.classifierRules);
                }
            });
            return result;
        } else {
            return null as any;
            // TODO rethink use of null, maybe make return type of function 'ValidatorDef | null'
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
