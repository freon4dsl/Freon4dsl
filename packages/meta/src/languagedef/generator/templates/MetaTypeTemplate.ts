import { PiLanguage } from "../../metalanguage/PiLanguage";
import { Names } from "../../../utils/Names";

export class MetaTypeTemplate {
    constructor() {
    }

    generateMetaType(language: PiLanguage): string {
        return `
        /**
         * Type ${Names.metaType(language)} is a union of the metatype, represented by a name, of all concepts 
         * and interfaces that are defined for language Demo.
         */
        export type ${Names.metaType(language)} = 
        ${language.concepts.map(c => `"${Names.concept(c)}"`)
            .concat(language.interfaces.map(c => `"${Names.interface(c)}"`))
            .join(" | ")}
        ;`;
    }

}
