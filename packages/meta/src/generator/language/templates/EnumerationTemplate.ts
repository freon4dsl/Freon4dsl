import { Names } from "../../Names";
import { PiLangEnumeration } from "../../../metalanguage/PiLanguage";

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
        import { WithType } from "./WithType";
        import { ${language.name}ConceptType } from "./${language.name}";
        import { ${mobxImports.join(",")} } from "@projectit/model";
        import { PiElement, PiExpression, PiBinaryExpression } from "@projectit/core";
    
        export class ${Names.enumeration(enumeration)} extends ${extendsClass} implements ${implementsPi}, WithType {
            readonly $type: ${language.name}ConceptType = "${Names.enumeration(enumeration)}";
            $id: string;
                
            constructor(id?: string) {
                super();
                if (!!id) { 
                    this.$id = id;
                } else {
                    this.$id = uuid.v4();
                }
            }

            ${enumeration.literals.map(lit => 
                `static ${lit}: ${Names.enumeration(enumeration)} = ${Names.enumeration(enumeration)}.fromString("${lit}")` ).join(";")}
            static ANY : ${Names.enumeration(enumeration)} = ${Names.enumeration(enumeration)}.fromString("ANY");
        
            private readonly literalName : string;
        
            public asString(): string {
                return this.literalName;
            }
        
            static fromString(v: string): ${Names.enumeration(enumeration)} {
                switch(v) {
                    ${enumeration.literals.map(lit => `case "${lit}": return ${Names.enumeration(enumeration)}.${lit};`).join(";")}
                    default: return ${Names.enumeration(enumeration)}.ANY;
                }
            }

            get$Type(): ${language.name}ConceptType {
                return this.$type;
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
