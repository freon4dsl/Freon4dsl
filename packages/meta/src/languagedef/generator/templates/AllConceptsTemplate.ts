import { Names } from "../../../utils/Names";
import { PiLanguageUnit } from "../../metalanguage/PiLanguage";

export class AllConceptsTemplate {
    constructor() {
    }

    generateAllConceptsClass(language: PiLanguageUnit): string {
        // sort all names alphabetically
        let tmp : string[] = [];
        language.concepts.map(c =>
            tmp.push(Names.concept(c))
        );
        language.interfaces.map(c =>
            tmp.push(Names.interface(c))
        );
        tmp = tmp.sort();

        // the template starts here
        return `
        import {
            ${tmp.map(c => 
                `${c}`
            ).join(", ")}
        } from "./index";

        export type ${Names.allConcepts(language)} =
        ${tmp.map(c => 
            `${c}`
        ).join(" | ")}
        ;`;
    }

}
