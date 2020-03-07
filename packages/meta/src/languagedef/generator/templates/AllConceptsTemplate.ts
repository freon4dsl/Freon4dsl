import { Names } from "../../../utils/Names";
import { PiLanguage } from "../../metalanguage/PiLanguage";

export class AllConceptsTemplate {
    constructor() {
    }

    generateAllConceptsClass(language: PiLanguage): string {
        // sort all names alphabetically
        let tmp : string[] = [];
        language.concepts.map(c => 
            tmp.push(Names.concept(c))
        );
        language.enumerations.map(c =>
            tmp.push(Names.enumeration(c))
        );
        language.types.map(c =>
            tmp.push(Names.type(c))
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
