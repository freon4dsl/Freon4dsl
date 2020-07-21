import { PiLanguage } from "../../languagedef/metalanguage";
import { PiParser } from "../../utils";
import { ValidatorChecker } from "../../validatordef/metalanguage";
import { PiValidatorDef } from "../metalanguage";

let validatorParser = require("./ValidatorGrammar");

export class ValidatorParser extends PiParser<PiValidatorDef> {
    public language: PiLanguage;

    constructor(language: PiLanguage) {
        super();
        this.parser = validatorParser;
        this.language = language;
        this.checker = new ValidatorChecker(language);
    }
}
