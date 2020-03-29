import { PiParser } from "../../utils";
import { PiDefEditorChecker, PiDefEditorLanguage } from "../metalanguage";

let editorParser = require("./EditorGrammar");

export class PiDefEditorParser extends PiParser<PiDefEditorLanguage> {

    constructor() {
        super();
        this.parser = editorParser;
        this.msg = "Editor";
        this.checker = new PiDefEditorChecker();
    }
}
