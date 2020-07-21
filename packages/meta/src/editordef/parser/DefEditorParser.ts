import { PiLanguage } from "../../languagedef/metalanguage";
import { PiParser } from "../../utils";
import { DefEditorChecker, DefEditorLanguage } from "../metalanguage";

let editorParser = require("./EditorGrammar");

export class DefEditorParser extends PiParser<DefEditorLanguage> {
    language: PiLanguage;

    constructor(language: PiLanguage) {
        super();
        this.language = language;
        this.parser = editorParser;
        this.checker = new DefEditorChecker(language);
    }
}
