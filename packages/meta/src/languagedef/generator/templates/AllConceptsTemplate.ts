import { Names } from "../../../utils";
import { PiLanguage } from "../../metalanguage";

export class AllConceptsTemplate {

    generateAllConceptsClass(language: PiLanguage): string {
        const unitNames = language.units.map(unit => Names.classifier(unit));
        // sort all names alphabetically
        let tmp: string[] = [];
        language.concepts.map(c =>
            tmp.push(Names.concept(c))
        );
        language.interfaces.map(c =>
            tmp.push(Names.interface(c))
        );
        tmp.push(...unitNames);
        tmp.push(Names.classifier(language.modelConcept));

        tmp = tmp.sort();

        // the template starts here
        return `
        import {
            ${tmp.map(c =>`${c}`).join(", ")}
        } from "./internal";

        /**
         * Type ${Names.allConcepts(language)} is a union of all concepts and interfaces that are defined for language ${language.name}.
         * This type is used instead of the more general FreNode interface or the MobxModelElementImpl class,
         * or even the type Object, to ensure that parts of the language environment work on the same set 
         * of instances. 
         */
        export type ${Names.allConcepts(language)} =
        ${tmp.map(c =>
            `${c}`
        ).join(" | ")}
        ;
        
                
        /**
         * Type MODELUNIT combines the metatype of all possible modelunits of language ${language.name}
         */
        export type ${Names.modelunit(language)} = ${unitNames.map(name => `${name}`).join("| ")};`;
    }

}
