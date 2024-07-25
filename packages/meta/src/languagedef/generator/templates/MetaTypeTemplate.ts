import { FreMetaLanguage } from "../../metalanguage/index.js";
import { GenerationUtil, Names } from "../../../utils/index.js";

export class MetaTypeTemplate {

    generateMetaType(language: FreMetaLanguage): string {
        const unitNames = language.units.map(unit => Names.classifier(unit));
        const tmp = GenerationUtil.sortUnitNames(language, unitNames);

        return `
        /**
         * Type ${Names.metaType()} is a union of the metatype, represented by a name, of all concepts
         * and interfaces that are defined for language Demo.
         */
        export type ${Names.metaType()} = ${tmp.map(u => `"${u}"`).join(" | ")};

        /**
         * Type MODELUNIT combines the metatype of all possible modelunits of language ${language.name}
         */
        export type ModelUnitMetaType = ${unitNames.map(name => `"${name}"`).join("| ")};`;
    }

}
