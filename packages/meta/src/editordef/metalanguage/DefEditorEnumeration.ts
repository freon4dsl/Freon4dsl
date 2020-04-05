import { DefEditor } from "./DefEditor";
import { DefEditorLanguage } from "./DefEditorLanguage";
import { DefEditorProjection } from "./DefEditorProjection";

export class DefEditorEnumeration implements DefEditor {
    languageEditor: DefEditorLanguage;

    projection: DefEditorProjection;
}
