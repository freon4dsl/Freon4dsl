import { Names } from "../../Names";
import { PiLangEnumeration } from "../../../metalanguage/PiLanguage";

export class EnumerationTemplate {
    constructor() {
    }

    generateEnumeration(enumeration: PiLangEnumeration): string {
        return `
        export type ${Names.enumeration(enumeration)} = ${enumeration.literals.map(lit => "\"" + lit + "\"").join(" | ")} 
        `;
    }
}
