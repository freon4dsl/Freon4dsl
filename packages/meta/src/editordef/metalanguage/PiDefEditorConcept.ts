import { PiDefEditor, DefEditorLanguage, DefEditorProjection } from ".";
import { PiLangConceptReference } from "../../languagedef/metalanguage";

export class PiDefEditorConcept implements PiDefEditor {
    languageEditor: DefEditorLanguage;
    concept: PiLangConceptReference;

    trigger: string;
    symbol: string;     // only for binary expressions

    projection: DefEditorProjection;
}
