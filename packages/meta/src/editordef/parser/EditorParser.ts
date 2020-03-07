import { PiEditorChecker } from "../metalanguage/PiEditorChecker";
import { PiLanguageEditor } from "../metalanguage/PiLanguageEditor";
import { PiParser } from "../../utils/PiParser";
let editorParser = require("./EditorGrammar");

export class EditorParser extends PiParser<PiLanguageEditor> {

    constructor() {
        super();
        this.parser = editorParser;
        this.msg = "Editor";
        this.checker = new PiEditorChecker();
    }
}
