import { PiParser } from "../../utils";
import { PiLanguageUnit } from "../../languagedef/metalanguage";
import { PiTypeDefinition } from "../metalanguage";
import { PiTyperChecker } from "../metalanguage";

let typerParser = require("./PiTyperGrammar");

export class PiTyperParser extends PiParser<PiTypeDefinition> {
    public language: PiLanguageUnit;

    constructor(language : PiLanguageUnit) {
        super();
        this.parser = typerParser;
        this.msg = "Typer";
        this.language = language;
        this.checker = new PiTyperChecker(language);
    }
}
