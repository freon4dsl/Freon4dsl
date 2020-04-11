import { DefEditor } from "./DefEditor";
import { DefEditorLanguage } from "./DefEditorLanguage";
import { MetaEditorProjection } from "./MetaEditorProjection";

export class DefEditorEnumeration implements DefEditor {
    languageEditor: DefEditorLanguage;

    projection: MetaEditorProjection;
}
