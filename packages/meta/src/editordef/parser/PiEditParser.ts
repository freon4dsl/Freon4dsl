import { PiLanguage } from "../../languagedef/metalanguage";
import { PiParser } from "../../utils";
import { PiEditChecker, PiEditUnit } from "../metalanguage";

const editorParser = require("./PiEditGrammar");

export class PiEditParser extends PiParser<PiEditUnit> {
    language: PiLanguage;

    constructor(language: PiLanguage) {
        super();
        this.language = language;
        this.parser = editorParser;
        this.checker = new PiEditChecker(language);
    }
}
