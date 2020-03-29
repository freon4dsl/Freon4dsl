import { PiDefEditor, PiDefEditorLanguage, PiDefEditorProjection } from ".";
import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";

export class PiDefEditorConcept implements PiDefEditor {
    languageEditor: PiDefEditorLanguage;
    concept: PiLangConceptReference;

    trigger: string;
    priority: number;   // only for binary expressions
    symbol: string;     // only for binary expressions

    isExpression: boolean;
    isBinaryExpression: boolean;
    isExpressionPlaceHolder: boolean;

    projection: PiDefEditorProjection;
}
