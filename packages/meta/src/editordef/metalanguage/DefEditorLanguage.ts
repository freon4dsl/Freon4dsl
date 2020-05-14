import { DefEditorConcept } from "./DefEditorConcept";
import { DefEditorEnumeration } from "./DefEditorEnumeration";
import { ParseLocation } from "../../utils";
import { PiConcept, PiLanguageUnit } from "../../languagedef/metalanguage";

export class DefEditorLanguage {
    location: ParseLocation;
    name: string;
    language: PiLanguageUnit;
    languageName: string;
    conceptEditors: DefEditorConcept[] = [];
    // enumerations: DefEditorEnumeration[] = [];

    constructor() {}

    findConceptEditor(cls: PiConcept): DefEditorConcept {
        const result = this.conceptEditors.find(con => con.concept.referred === cls);
        // console.log("Finding editor for "+ cls.name + " is [" + result +  "]");
        return result;
    }
}
