import { PiParser } from "../../utils/PiParser";
import { PiLanguage } from "../../languagedef/metalanguage/PiLanguage";
import { ValidatorDef } from "../metalanguage/ValidatorDefLang";
import { ValidatorChecker } from "../../validatordef/metalanguage/ValidatorChecker";

let validatorParser = require("./ValidatorGrammar");

export class ValidatorParser extends PiParser<ValidatorDef> {
    public language: PiLanguage;

    constructor(language : PiLanguage) {
        super();
        this.parser = validatorParser;
        this.msg = "Validator";
        this.language = language;
        this.checker = new ValidatorChecker(language);
    }
}
