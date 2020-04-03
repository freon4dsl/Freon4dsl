import { PiParser } from "../../utils";
import { PiDefEditorChecker, DefEditorLanguage } from "../metalanguage";

let editorParser = require("./EditorGrammar");

export class DefEditorParser extends PiParser<DefEditorLanguage> {

    constructor() {
        super();
        this.parser = editorParser;
        this.msg = "Editor";
        this.checker = new PiDefEditorChecker();
    }
}
