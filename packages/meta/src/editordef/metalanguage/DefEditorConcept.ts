import { useDebugValue } from "react";
import { DefEditor, DefEditorLanguage, MetaEditorProjection } from ".";
import { PiLangConceptReference } from "../../languagedef/metalanguage";
import { ParseLocation } from "../../utils";

export class DefEditorConcept implements DefEditor {
    location: ParseLocation;
    languageEditor: DefEditorLanguage;
    concept: PiLangConceptReference;

    _trigger: string = null;
    symbol: string = null;     // only for binary expressions

    get trigger(): string {
        if(!!this._trigger) {
            return this._trigger
        } else {
            return this.symbol;
        }
    }

    set trigger(value: string) {
        this._trigger = value;
    }

    projection: MetaEditorProjection = null;
}
