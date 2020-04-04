import { PiLanguageUnit } from "../../languagedef/metalanguage";
import { PiParser } from "../../utils";
import { PiDefEditorChecker, DefEditorLanguage } from "../metalanguage";

let editorParser = require("./EditorGrammar");

export class DefEditorParser extends PiParser<DefEditorLanguage> {
    language: PiLanguageUnit;

    constructor(language: PiLanguageUnit) {
        super();
        this.language = language;
        this.parser = editorParser;
        this.msg = "Editor";
        this.checker = new PiDefEditorChecker(language);
    }
}
