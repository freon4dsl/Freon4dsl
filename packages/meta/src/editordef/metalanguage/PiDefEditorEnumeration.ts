import { PiDefEditor } from "./PiDefEditor";
import { PiDefEditorLanguage } from "./PiDefEditorLanguage";
import { PiDefEditorProjection } from "./PiDefEditorProjection";

export class PiDefEditorEnumeration implements PiDefEditor {
    languageEditor: PiDefEditorLanguage;

    projection: PiDefEditorProjection;
}
