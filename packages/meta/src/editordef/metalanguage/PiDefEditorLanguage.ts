import { PiLanguageUnit } from "../../languagedef/metalanguage/PiLanguage";
import { PiDefEditorConcept } from "./PiDefEditorConcept";
import { PiDefEditorEnumeration } from "./PiDefEditorEnumeration";

export class PiDefEditorLanguage {
    name: string;
    language: PiLanguageUnit;
    concepts: PiDefEditorConcept[] = [];
    enumerations: PiDefEditorEnumeration[] = [];

    constructor() {
    }

    // findConcept(name: string): PiConceptEditor {
    //     return this.concepts.find(con => con.name === name);
    // }
}

