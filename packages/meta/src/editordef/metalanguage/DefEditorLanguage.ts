import { DefEditorConcept } from "./DefEditorConcept";
import { DefEditorEnumeration } from "./DefEditorEnumeration";
import { ParseLocation } from "../../utils";
import { PiConcept, PiLanguageUnit } from "../../languagedef/metalanguage";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference} from "../../languagedef/metalanguage/PiElementReference";

export class DefEditorLanguage {
    location: ParseLocation;
    name: string;
    language: PiLanguageUnit;
    languageName: string;
    conceptEditors: DefEditorConcept[] = [];
    enumerations: DefEditorEnumeration[] = [];

    constructor() {}

    findConceptEditor(cls: PiConcept): DefEditorConcept {
        const result = this.conceptEditors.find(con => con.concept.referred === cls);
        // console.log("Finding editor for "+ cls.name + " is [" + result +  "]");
        return result;
    }
}
