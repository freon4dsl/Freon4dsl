import { FreLanguage } from "../../metalanguage";
import { Names } from "../../../utils";

export class MetaTypeTemplate {

    generateMetaType(language: FreLanguage): string {
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
        return `
        /**
         * Type ${Names.metaType(language)} is a union of the metatype, represented by a name, of all concepts 
         * and interfaces that are defined for language Demo.
         */
        export type ${Names.metaType(language)} = ${tmp.map(u => `"${u}"`).join(" | ")};
        
        /**
         * Type MODELUNIT combines the metatype of all possible modelunits of language ${language.name}
         */
        export type ModelUnitMetaType = ${unitNames.map(name => `"${name}"`).join("| ")};`;
    }

}
