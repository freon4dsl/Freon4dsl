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

        /**
         * Type ${Names.allConcepts(language)} is a union of all concepts and interfaces that are defined for language ${language.name}.
         * This type is used instead of the more general PiElement interface or the MobxModelElementImpl class,
         * or even the type Object, to ensure that parts of the language environment work on the same set 
         * of instances. 
         */
        export type ${Names.allConcepts(language)} =
        ${tmp.map(c => 
            `${c}`
        ).join(" | ")}
        ;`;
    }

}
