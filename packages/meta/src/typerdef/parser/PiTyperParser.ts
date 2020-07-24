import { PiParser } from "../../utils";
import { PiLanguage } from "../../languagedef/metalanguage";
import { PiTypeDefinition } from "../metalanguage";
import { PiTyperChecker } from "../metalanguage";

let typerParser = require("./PiTyperGrammar");

export class PiTyperParser extends PiParser<PiTypeDefinition> {
    public language: PiLanguage;

    constructor(language: PiLanguage) {
        super();
        this.parser = typerParser;
        this.language = language;
        this.checker = new PiTyperChecker(language);
    }
}
