import { PiConcept, PiEnumeration, PiLanguage, PiLanguageElementProperty, PiLanguageProperty } from "./PiLanguage";
import { MobxModelElementImpl } from "@projectit/model";
import parserTypeScript = require("prettier/parser-typescript");

const prettier = require("prettier/standalone");

export class PiLanguageTemplates {
    constructor() {
    }

    generateMetaClass(element: PiConcept, language: PiLanguage): string {
        const hasSuper = !!element.base;
        const extendsClass = hasSuper ? element.base : "MobxModelElementImpl";
        console.log("calling generateMetaClass for " + element.name + " hasSuper " + hasSuper);

        const imports = Array.from(
            new Set(
                element.parts
                    .concat(element.references)
                    .map(part => part.type)
                    .filter(name => !(name === element.name))
                    .concat(element.properties.map(p => p.type).filter(t => language.enumerations.some(e => e.name === t)))
                    .concat((element.base? element.base : null))
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
        if (element.parts.some(part => part.isList)) {
            mobxImports.push("observablelistpart");
        }
        if (element.parts.some(part => !part.isList)) {
            mobxImports.push("observablepart");
        }
        if (element.references.some(ref => ref.isList)) {
            mobxImports.push("observablelistreference");
        }
        if (element.references.some(ref => !ref.isList)) {
            mobxImports.push("observablereference");
        }

        const result = `
        
            ${element.properties.length > 0 ? `import { observable } from "mobx";` : ""}

            import { ${mobxImports.join(",")} } from "@projectit/model";
            ${imports.map(imp => `import { ${imp} } from "./${imp}";`).join("")}

            @model
            export class ${element.name} extends ${extendsClass} {
                $type = "${element.name}";
    
                // ${hasSuper ? "$id: string = uuid.v4();" : ""}
                    
                ${element.properties.map(p => this.generatePrimitiveProperty(p)).join("")}
                ${element.parts.map(p => this.generatePartProperty(p)).join("")}
                ${element.references.map(p => this.generateReferenceProperty(p)).join("")}
                
                constructor() {
                    super();
                }
            }
        `;
        // return result;
        return prettier.format(result, {
            parser: "typescript",
            printWidth: 120,
            tabWidth: 4,
            plugins: [parserTypeScript]
        });
    }

    generatePrimitiveProperty(property: PiLanguageProperty): string {
        return `
            @observable ${property.name}: ${property.type} ${property.isList ? "[]" : ""};
        `;
    }

    generatePartProperty(property: PiLanguageElementProperty): string {
        const decorator = property.isList ? "@observablelistpart" : "@observablepart";
        const arrayType = property.isList ? "[]" : "";
        return `
            ${decorator} ${property.name} : ${property.type}${arrayType};
        `;
    }

    generateReferenceProperty(property: PiLanguageElementProperty): string {
        const decorator = property.isList ? "@observablelistreference" : "@observablereference";
        const arrayType = property.isList ? "[]" : "";
        return `
            ${decorator} ${property.name} : ${property.type}${arrayType};
        `;
    }

    generateEnumeration(enumeration: PiEnumeration): string {
        var result = `
        export type ${enumeration.name} = ${enumeration.literals.map(lit => "\"" + lit.name + "\"").join(" | ")} 
        `;
        return prettier.format(result, {
            parser: "typescript",
            printWidth: 120,
            tabWidth: 4,
            plugins: [parserTypeScript]
        });

    }
}
