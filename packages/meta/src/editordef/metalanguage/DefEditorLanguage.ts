import { PiConcept, PiElementReference, PiLanguageUnit } from "../../languagedef/metalanguage";
import { DefEditorConcept } from "./DefEditorConcept";
import { DefEditorEnumeration } from "./DefEditorEnumeration";
import { ParseLocation } from "../../utils";

export class DefEditorLanguage {
    location: ParseLocation;
    name: string;
    language: PiLanguageUnit;
    conceptEditors: DefEditorConcept[] = [];
    enumerations: DefEditorEnumeration[] = [];

    constructor() {}

    findConceptEditor(cls: PiConcept): DefEditorConcept {
        const result = this.conceptEditors.find(con => con.concept.referred === cls);
        // console.log("Finding editor for "+ cls.name + " is [" + result +  "]");
        return result;
    }

    addDefaults() {
        this.language.concepts.forEach(cls => {
            let conceptEditor = this.findConceptEditor(cls);
            if (conceptEditor === null || conceptEditor === undefined) {
                // console.log("Adding editor for " + cls.name);
                conceptEditor = new DefEditorConcept();
                conceptEditor.concept = PiElementReference.createNamed<PiConcept>(cls.name, "PiConcept");
                conceptEditor.concept.owner = this.language;
                this.conceptEditors.push(conceptEditor);
            }
            if (conceptEditor.trigger === null) {
                conceptEditor.trigger = cls.name;
            }
            if (conceptEditor.symbol === null) {
                conceptEditor.symbol = cls.name;
            }
        });
    }
}
