import { MobxModelElementImpl } from "@projectit/model";
import { MetaConcept, MetaElementProperty, MetaModel, MetaPrimitiveProperty } from "./MetaModel";

const prettier = require("prettier/standalone");

export class PiMetaTemplates {

    constructor() {
    }

    generateMetaClass(element: MetaConcept): string {
        const hasSuper = !!(element.superConcept);
        const extendsClass = hasSuper ? element.superConcept.name : 'MobxModelElementImpl';
        console.log("calling generateMetaClass for " + element.name + " hasSuper " + hasSuper);

        const imports = Array.from(new Set(element.parts.concat(element.references).map(part => part.type.element.name).filter(name => !(name === element.name))));
        const mobxImports: string[] = ["model"];
        // if( element.references.length > 0) {
        //     mobxImports.push("observable")
        // }
        if (!hasSuper){
            mobxImports.push("MobxModelElementImpl");
        }
        if( element.parts.some(part => part.type.isList)) {
            mobxImports.push("observablelistpart")
        }
        if( element.parts.some(part => !part.type.isList)) {
            mobxImports.push("observablepart")
        }
        if( element.references.some(ref => ref.type.isList)) {
            mobxImports.push("observablelistreference")
        }
        if( element.references.some(ref => !ref.type.isList)) {
            mobxImports.push("observablereference")
        }

        const result = `
        
            ${element.properties.length > 0 ? `import { observable } from "mobx";` : ""}

            import { ${mobxImports.join(",")} } from "projectit-model";
            ${imports.map(imp => 
                `import { ${imp} } from "./${imp}";`
            ).join("")}

            @model
            export class ${element.name} extends ${extendsClass} {
                $type = "${element.name}";
    
                ${hasSuper ? "$id: string = uuid.v4();" : ""}
                    
                ${element.properties.map(p => this.generatePrimitiveProperty(p)).join("")}
                ${element.parts.map(p => this.generatePartProperty(p)).join("")}
                ${element.references.map(p => this.generateReferenceProperty(p)).join("")}
                
                constructor() {
                    super();
                }
            }
        `;
        // return result;
        return prettier.format(result, {parser: "typescript", printWidth: 120, tabWidth: 4});
    }

    generatePrimitiveProperty(property: MetaPrimitiveProperty): string {
        return `
            @observable ${property.name}: ${property.type.primitive} ${property.type.isList ? "[]" : ""};
        `;
    }

    generatePartProperty(property: MetaElementProperty): string {
        const decorator = property.type.isList ? '@observablelistpart' : '@observablepart';
        const arrayType = property.type.isList ? '[]' : '';
        return `
            ${decorator} ${property.name} : ${property.type.element.name}${arrayType};
        `;
    }

    generateReferenceProperty(property: MetaElementProperty): string {
        const decorator = property.type.isList ? '@observablelistreference' : '@observablereference';
        const arrayType = property.type.isList ? '[]' : '';
        return `
            ${decorator} ${property.name} : ${property.type.element.name}${arrayType};
        `;
    }


}
