import { PiLanguageUnit } from "../../languagedef/metalanguage";
import { PiDefEditorConcept } from "./PiDefEditorConcept";
import { PiDefEditorEnumeration } from "./PiDefEditorEnumeration";

export class PiDefEditorLanguage {
    name: string;
    language: PiLanguageUnit;
    conceptEditors: PiDefEditorConcept[] = [];
    enumerations: PiDefEditorEnumeration[] = [];

    constructor() {
    }

    // findConcept(name: string): PiConceptEditor {
    //     return this.concepts.find(con => con.name === name);
    // }
}

