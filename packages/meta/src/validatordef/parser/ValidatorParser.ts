import { PiLanguage } from "../../languagedef/metalanguage/index";
import { PiParser } from "../../utils";
import { ValidatorChecker } from "../../validatordef/metalanguage";
import { PiValidatorDef } from "../metalanguage";

const validatorParser = require("./ValidatorGrammar");
import { setCurrentFileName } from "./ValidatorCreators";
import { setCurrentFileName as expressionFileName } from "../../languagedef/parser/ExpressionCreators";

export class ValidatorParser extends PiParser<PiValidatorDef> {
    public language: PiLanguage;

    constructor(language: PiLanguage) {
        super();
        this.parser = validatorParser;
        this.language = language;
        this.checker = new ValidatorChecker(language);
    }

    protected merge(submodels: PiValidatorDef[]): PiValidatorDef {
        if (submodels.length > 0) {
            let result: PiValidatorDef = submodels[0];
            submodels.forEach((sub, index) => {
                if (index > 0) {
                     result.conceptRules.push(...sub.conceptRules);
                     // TODO: include a check on validatorname???
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
}
