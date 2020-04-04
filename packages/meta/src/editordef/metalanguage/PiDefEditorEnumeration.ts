import { PiDefEditor } from "./PiDefEditor";
import { DefEditorLanguage } from "./DefEditorLanguage";
import { DefEditorProjection } from "./DefEditorProjection";

export class PiDefEditorEnumeration implements PiDefEditor {
    languageEditor: DefEditorLanguage;

    projection: DefEditorProjection;
}
