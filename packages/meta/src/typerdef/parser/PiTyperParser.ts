import { PiParser } from "../../utils/PiParser";
import { PiLanguageUnit } from "../../languagedef/metalanguage/PiLanguage";
import { PiTyperDef } from "../metalanguage/PiTyperDefLang";
import { PiTyperChecker } from "../metalanguage/PiTyperChecker";

let typerParser = require("./PiTyperGrammar");

export class PiTyperParser extends PiParser<PiTyperDef> {
    public language: PiLanguageUnit;

    constructor(language : PiLanguageUnit) {
        super();
        this.parser = typerParser;
        this.msg = "Typer";
        this.language = language;
        this.checker = new PiTyperChecker(language);
    }
}
