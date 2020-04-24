import { DefEditor, DefEditorLanguage, MetaEditorProjection } from ".";
import { ParseLocation } from "../../utils";
import { PiConcept, PiElementReference } from "../../languagedef/metalanguage";

export class DefEditorConcept implements DefEditor {
    location: ParseLocation;
    languageEditor: DefEditorLanguage;
    concept: PiElementReference<PiConcept>;

    _trigger: string = null;
    symbol: string = null; // only for binary expressions

    get trigger(): string {
        if (!!this._trigger) {
            return this._trigger;
        } else {
            return this.symbol;
        }
    }

    set trigger(value: string) {
        this._trigger = value;
    }

    projection: MetaEditorProjection = null;
}
