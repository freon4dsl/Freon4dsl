import { PiLanguage } from "../PiLanguage";
import { PiConceptEditor } from "./PiConceptEditor";
import { PiEnumerationEditor } from "./PiEnumerationEditor";

export class PiLanguageEditor {
    name: string;
    language: PiLanguage;
    concepts: PiConceptEditor[] = [];
    enumerations: PiEnumerationEditor[] = [];

    constructor() {
    }

    // findConcept(name: string): PiConceptEditor {
    //     return this.concepts.find(con => con.name === name);
    // }
}

