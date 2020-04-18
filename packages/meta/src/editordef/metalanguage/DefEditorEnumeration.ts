import { DefEditor } from "./DefEditor";
import { DefEditorLanguage } from "./DefEditorLanguage";
import { MetaEditorProjection } from "./MetaEditorProjection";
import { ParseLocation } from "../../utils";

export class DefEditorEnumeration implements DefEditor {
    languageEditor: DefEditorLanguage;
    location: ParseLocation;

    projection: MetaEditorProjection;
}
