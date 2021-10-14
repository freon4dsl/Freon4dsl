import { PiLanguage } from "../../metalanguage";
import { Names } from "../../../utils";

export class MetaTypeTemplate {

    generateMetaType(language: PiLanguage): string {
        const unitNames = language.units.map(unit => Names.classifier(unit));
        return `
        /**
         * Type ${Names.metaType(language)} is a union of the metatype, represented by a name, of all concepts 
         * and interfaces that are defined for language Demo.
         */
        export type ${Names.metaType(language)} = 
        ${unitNames.map(u => `"${u}"`)
            .concat(language.concepts.map(c => `"${Names.concept(c)}"`)
            .concat(language.interfaces.map(c => `"${Names.interface(c)}"`)))
            .concat(`"${Names.classifier(language.modelConcept)}"`)
            .join(" | ")}
        ;
        
        /**
         * Type MODELUNIT combines the metatype of all possible modelunits of language ${language.name}
         */
        export type ModelUnitMetaType = ${unitNames.map(name => `"${name}"`).join("| ")};`;
    }

}
