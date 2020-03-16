import { PiParser } from "../../utils/PiParser";
import { PiLanguageUnit } from "../../languagedef/metalanguage/PiLanguage";
import { PiValidatorDef } from "../metalanguage/ValidatorDefLang";
import { ValidatorChecker } from "../../validatordef/metalanguage/ValidatorChecker";

let validatorParser = require("./ValidatorGrammar");

export class ValidatorParser extends PiParser<PiValidatorDef> {
    public language: PiLanguageUnit;

    constructor(language : PiLanguageUnit) {
        super();
        this.parser = validatorParser;
        this.msg = "Validator";
        this.language = language;
        this.checker = new ValidatorChecker(language);
    }
}
