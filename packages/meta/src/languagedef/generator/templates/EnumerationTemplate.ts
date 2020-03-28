import { Names } from "../../../utils/Names";
import { PiLangEnumeration } from "../../metalanguage/PiLanguage";

export class EnumerationTemplate {
    constructor() {
    }

    generateEnumeration(enumeration: PiLangEnumeration): string {
        const language = enumeration.language;
        const extendsClass = "MobxModelElementImpl";
        const isBinaryExpression = false;
        const isExpression = false;       
        const implementsPi = (isExpression ? "PiExpression": (isBinaryExpression ? "PiBinaryExpression" : "PiElement"));    

        const mobxImports: string[] = ["model"];
        // if( element.references.length > 0) {
        //     mobxImports.push("observable")
        // }
        mobxImports.push("MobxModelElementImpl");

        // Template starts here
        return `
        import * as uuid from "uuid";
        import { ${language.name}ConceptType } from "./${language.name}";
        import { ${mobxImports.join(",")} } from "@projectit/core";
        import { PiElement, PiExpression, PiBinaryExpression } from "@projectit/core";
    
        export class ${Names.enumeration(enumeration)} extends ${extendsClass} implements ${implementsPi} {
            readonly $typename: ${language.name}ConceptType = "${Names.enumeration(enumeration)}";
            $id: string;
                
            constructor(name: string, id?: string) {
                super();
                this.name = name;
                if (!!id) { 
                    this.$id = id;
                } else {
                    this.$id = uuid.v4();
                }
            }

            ${enumeration.literals.map(lit => 
                `static ${lit}: ${Names.enumeration(enumeration)} = ${Names.enumeration(enumeration)}.fromString("${lit}")` ).join(";")}
            static $piANY : ${Names.enumeration(enumeration)} = ${Names.enumeration(enumeration)}.fromString("$piANY");

            static values = [${enumeration.literals.map(l => `${Names.enumeration(enumeration)}.${l}`).join(", ")}]
        
            public readonly name : string;
        
            public asString(): string {
                return this.name;
            }
        
            static fromString(v: string): ${Names.enumeration(enumeration)} {
                switch(v) {
                    ${enumeration.literals.map(lit => `case "${lit}": 
                    if (this.${lit} !== null) {
                        return new ${Names.enumeration(enumeration)}("${lit}");
                    } else {
                        return ${Names.enumeration(enumeration)}.${lit};
                    }`                   
                    ).join(";")}
                    default: 
                    if (this.$piANY !== null) {
                        return new ${Names.enumeration(enumeration)}("$piANY");
                    } else {
                        return ${Names.enumeration(enumeration)}.$piANY;
                    }
                }
            }

            piLanguageConcept(): ${language.name}ConceptType {
                return this.$typename;
            }

            piId(): string {
                return this.$id;
            }
            
            piIsExpression(): boolean {
                return ${isExpression || isBinaryExpression};
            }
            
            piIsBinaryExpression(): boolean {
                return ${isBinaryExpression};
            }
            
        }`;
    }
}
