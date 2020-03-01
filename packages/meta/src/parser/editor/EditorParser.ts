import { PiEditorChecker } from "../../metalanguage/editor/PiEditorChecker";
import { PiLanguageEditor } from "../../metalanguage/editor/PiLanguageEditor";
import { PiParser } from "../PiParser";
let editorParser = require("./EditorGrammar");

export class EditorParser extends PiParser<PiLanguageEditor> {

    constructor() {
        super();
        this.parser = editorParser;
        this.msg = "Editor";
        this.checker = new PiEditorChecker();
    }
}
