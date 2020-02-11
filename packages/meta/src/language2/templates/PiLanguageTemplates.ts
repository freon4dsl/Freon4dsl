import {
   PiLanguageEnumerationDef,
    PiLanguageDef,
    PiLanguageConceptDef,
    PiLanguageElementPropertyDef,
    PiLanguagePrimitivePropertyDef
} from "../PiLanguageDef";
import { MobxModelElementImpl } from "@projectit/model";
import parserTypeScript = require("prettier/parser-typescript");

const prettier = require("prettier/standalone");

export class PiLanguageTemplates {
    constructor() {
    }

    generateMetaClass(concept: PiLanguageConceptDef, language: PiLanguageDef): string {
        const hasSuper = !!concept.base;
        const extendsClass = hasSuper ? concept.base.concept : "MobxModelElementImpl";
        const hasName = concept.properties.some( p => p.name === "name");
        console.log("calling generateMetaClass for " + concept.name + " hasSuper " + hasSuper);

        const imports = Array.from(
            new Set(
                concept.parts.map(p => p.type.concept)
                    .concat(concept.references.map(r => r.type.concept))
                    .concat(language.enumerations.map(e => e.name))
                    .filter(name => !(name === concept.name))
                    // .concat(element.properties.map(p => p.type).filter(t => language.enumerations.some(e => e.name === t)))
                    .concat((concept.base? concept.base.concept : null))
                    .filter(r => r !== null)
            )
        );

        const mobxImports: string[] = ["model"];
        // if( element.references.length > 0) {
        //     mobxImports.push("observable")
        // }
        if (!hasSuper) {
            mobxImports.push("MobxModelElementImpl");
        }
        if (concept.parts.some(part => part.isList)) {
            mobxImports.push("observablelistpart");
        }
        if (concept.parts.some(part => !part.isList)) {
            mobxImports.push("observablepart");
        }
        if (concept.references.some(ref => ref.isList)) {
            mobxImports.push("observablelistreference");
        }
        if (concept.references.some(ref => !ref.isList)) {
            mobxImports.push("observablereference");
        }

        // Template starts here
        const result = `
            ${concept.properties.length > 0 ? `import { observable } from "mobx";` : ""}
            import * as uuid from "uuid";
            import { ${mobxImports.join(",")} } from "@projectit/model";
            ${imports.map(imp => `import { ${imp} } from "./${imp}";`).join("")}

            @model
            export class ${concept.name} extends ${extendsClass} {
                $type = "${concept.name}";
                ${!hasSuper ? "$id: string;" : ""};
                    
                constructor(id?: string) {
                    ${!hasSuper ? "super();" : "super(id);" }
                    ${!hasSuper ? `
                        if (!!id) { 
                            this.$id = id;
                        } else {
                            this.$id = uuid.v4();
                        }` : ""
                    }
                }
                
                ${concept.properties.map(p => this.generatePrimitiveProperty(p)).join("")}
                ${concept.parts.map(p => this.generatePartProperty(p)).join("")}
                ${concept.references.map(p => this.generateReferenceProperty(p)).join("")}

                ${ hasName ? `
                static create(name: string): ${concept.name} {
                    const result = new ${concept.name}();
                    result.name = name;
                    return result;
                }`
                : "" }
                
            }
        `;
        // return result;
        return prettier.format(result, {
            parser: "typescript",
            printWidth: 140,
            tabWidth: 4,
            plugins: [parserTypeScript]
        });
    }

    generatePrimitiveProperty(property: PiLanguagePrimitivePropertyDef): string {
        return `
            @observable ${property.name}: ${property.type} ${property.isList ? "[]" : ""};
        `;
    }

    generatePartProperty(property: PiLanguageElementPropertyDef): string {
        const decorator = property.isList ? "@observablelistpart" : "@observablepart";
        const arrayType = property.isList ? "[]" : "";
        return `
            ${decorator} ${property.name} : ${property.type.concept}${arrayType};
        `;
    }

    generateReferenceProperty(property: PiLanguageElementPropertyDef): string {
        const decorator = property.isList ? "@observablelistreference" : "@observablereference";
        const arrayType = property.isList ? "[]" : "";
        return `
            ${decorator} ${property.name} : ${property.type.concept}${arrayType};
        `;
    }

    generateEnumeration(enumeration: PiLanguageEnumerationDef): string {
        var result = `
        export type ${enumeration.name} = ${enumeration.literals.map(lit => "\"" + lit + "\"").join(" | ")} 
        `;
        return prettier.format(result, {
            parser: "typescript",
            printWidth: 120,
            tabWidth: 4,
            plugins: [parserTypeScript]
        });

    }

    generateLanguage(lang: PiLanguageDef): string {
        const result = `
        import { PiLanguage } from "../PiLanguage";
        
        export const ${lang.name} : PiLanguage = 
        ${JSON.stringify(lang, null, 4)};
        `;

        return prettier.format(result, {
            parser: "typescript",
            printWidth: 120,
            tabWidth: 4,
            plugins: [parserTypeScript]
        });

    }
}
