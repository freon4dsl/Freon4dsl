import { Editor } from "./Editor";
import { PiLanguageEditor } from "./PiLanguageEditor";
import { PiProjectionTemplate } from "./PiProjectionTemplate";

export class PiEnumerationEditor implements Editor {
    languageEditor: PiLanguageEditor;

    projection: PiProjectionTemplate;
}
