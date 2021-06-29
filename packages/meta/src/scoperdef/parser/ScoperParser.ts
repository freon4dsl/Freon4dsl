import { PiLanguage } from "../../languagedef/metalanguage";
import { PiParser } from "../../utils";
import { PiScopeDef, ScoperChecker } from "../metalanguage";
import { setCurrentFileName } from "./ScoperCreators";
import { setCurrentFileName as expressionFileName } from "../../languagedef/parser/ExpressionCreators";

const scoperParser = require("./ScoperGrammar");

export class ScoperParser extends PiParser<PiScopeDef> {
    public language: PiLanguage;

    constructor(language: PiLanguage) {
        super();
        this.parser = scoperParser;
        this.language = language;
        this.checker = new ScoperChecker(language);
    }

    protected merge(submodels: PiScopeDef[]): PiScopeDef {
        if (submodels.length > 0) {
            let result: PiScopeDef = submodels[0];
            submodels.forEach((sub, index) => {
                if (index > 0) {
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
