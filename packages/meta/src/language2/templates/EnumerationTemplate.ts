import { PiLangEnumeration } from "../PiLanguage";

export class EnumerationTemplate {
    constructor() {
    }

    generateEnumeration(enumeration: PiLangEnumeration): string {
        return `
        export type ${enumeration.name} = ${enumeration.literals.map(lit => "\"" + lit + "\"").join(" | ")} 
        `;
    }
}
