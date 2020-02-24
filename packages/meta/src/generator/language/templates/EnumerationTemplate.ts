import { Names } from "../../Names";
import { PiLangEnumeration } from "../../../metalanguage/PiLanguage";

export class EnumerationTemplate {
    constructor() {
    }

    generateEnumeration(enumeration: PiLangEnumeration): string {
        return `
        
        export class ${Names.enumeration(enumeration)}  {
            ${enumeration.literals.map(lit => 
                `static ${lit}: ${Names.enumeration(enumeration)} = new ${Names.enumeration(enumeration)}("${lit}");` ).join(";")}
            static ANY : ${Names.enumeration(enumeration)} = new ${Names.enumeration(enumeration)}("ANY");
        
            private readonly literalName : string;
        
            constructor(n : string) {
                this.literalName = n;
            }
        
            public asString(): string {
                return this.literalName;
            }
        
            static fromString(v: string): ${Names.enumeration(enumeration)} {
                switch(v) {
                    ${enumeration.literals.map(lit => `case "${lit}": return ${Names.enumeration(enumeration)}.${lit};`).join(";")}
                    default: return ${Names.enumeration(enumeration)}.ANY;
                }
            }
        
        }`;
    }
}
