import { PiDefEditor, DefEditorLanguage, DefEditorProjection } from ".";
import { PiLangConceptReference } from "../../languagedef/metalanguage";

export class DefEditorConcept implements PiDefEditor {
    languageEditor: DefEditorLanguage;
    concept: PiLangConceptReference;

    trigger: string = null;
    symbol: string = null;     // only for binary expressions

    projection: DefEditorProjection;
}
