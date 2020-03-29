import { PiDefEditor, PiDefEditorLanguage, PiDefEditorProjection } from ".";
import { PiLangConceptReference } from "../../languagedef/metalanguage";

export class PiDefEditorConcept implements PiDefEditor {
    languageEditor: PiDefEditorLanguage;
    concept: PiLangConceptReference;

    trigger: string;
    symbol: string;     // only for binary expressions

    projection: PiDefEditorProjection;
}
