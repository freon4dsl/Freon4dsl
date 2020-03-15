import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";
import { Editor } from "./Editor";
import { PiLanguageEditor } from "./PiLanguageEditor";
import { PiProjectionTemplate } from "./PiProjectionTemplate";

export class PiConceptEditor implements Editor {
    languageEditor: PiLanguageEditor;
    concept: PiLangConceptReference;

    trigger: string;
    priority: number;   // only for binary expressions
    symbol: string;     // only for binary expressions

    isExpression: boolean;
    isBinaryExpression: boolean;
    isExpressionPlaceHolder: boolean;

    projection: PiProjectionTemplate;
}
