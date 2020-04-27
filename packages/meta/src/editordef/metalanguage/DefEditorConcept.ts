import { DefEditor, DefEditorLanguage, MetaEditorProjection } from ".";
import { ParseLocation } from "../../utils";
import { PiConcept } from "../../languagedef/metalanguage";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference} from "../../languagedef/metalanguage/PiElementReference";

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
