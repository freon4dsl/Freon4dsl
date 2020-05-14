import { PiLanguageUnit } from "../../metalanguage/PiLanguage";
import { Names } from "../../../utils/Names";

export class MetaTypeTemplate {
    constructor() {
    }

    generateMetaType(language: PiLanguageUnit): string {
        return `
        /**
         * Type ${Names.metaType(language)} is a union of the metatype, represented by a name, of all concepts 
         * and interfaces that are defined for language Demo.
         */
        export type ${Names.metaType(language)} = 
        ${language.concepts.map(c => `"${c.name}"`)
            .concat(language.interfaces.map(c => `"${c.name}"`))
            .join(" | ")}
        ;`;
    }

}
