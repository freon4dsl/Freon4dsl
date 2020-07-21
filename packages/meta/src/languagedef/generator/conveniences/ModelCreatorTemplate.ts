import { Names } from "../../../utils/Names";
import { LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiConcept, PiLanguage } from "../../metalanguage/PiLanguage";

// TODO decide whether to keep generator 'ModelCreatorTemplate'
export class ModelCreatorTemplate {
    constructor() {
    }

    generateModelCreator(language: PiLanguage, relativePath: string): string {
        // TODO use Names for class unitName
        
        // the template starts here
        return `
        import { ${this.createImports(language)}, ${Names.PiElementReference} } from "${relativePath}${LANGUAGE_GEN_FOLDER}"; 

        export class ${language.name}Creator {

        ${language.concepts.map(concept => 
            `${concept.isAbstract? `` : 
            `public create${concept.name}(${this.makeParams(concept)}) : ${concept.name} {
                let _result = new ${concept.name}();
                ${concept.allPrimProperties().map(prop =>
                    `${prop.isList? `if(${prop.name} !== null) _result.${prop.name}.push(${prop.name});`
                        :
                        `_result.${prop.name} = ${prop.name};`}`
                ).join("\n")} 
                ${concept.allParts().map(prop => 
                `${prop.isList? `if(${prop.name} !== null) _result.${prop.name}.push(${prop.name});` 
                    : 
                    `_result.${prop.name} = ${prop.name};`}`
                ).join("\n")}
                ${concept.allReferences().map(prop => 
                `${prop.isList? `if(${prop.name} !== null) _result.${prop.name}.push(${Names.PiElementReference}.create<${prop.type.name}>(${prop.name}, "${prop.type.name}"));` 
                    : 
                    `_result.${prop.name} = ${Names.PiElementReference}.create<${prop.type.name}>(${prop.name}, "${prop.type.name}");`}`
                ).join("\n")}
                return _result;
            }`
        }`).join("\n") }
        }`;
    }

    private makeParams(concept: PiConcept) : string {
        // TODO would like to use allProperties() here, but PrimProperties give error
        let paramlist: string[] = [];
        let optionalParamList: string[] = [];
        let questionmark = `?`;
        for (let prop of concept.allPrimProperties()) {
            if (prop.isOptional) {
                optionalParamList.push(`${prop.name}${questionmark}: ${prop.primType}`);
            } else {
                paramlist.push(`${prop.name}: ${prop.primType}`);
            }
        }
        for (let prop of concept.allParts()) {
            if (prop.isOptional) {
                optionalParamList.push(`${prop.name}${questionmark}: ${prop.type.name}`);
            } else {
                paramlist.push(`${prop.name}: ${prop.type.name}`);
            }
        }
        for (let prop of concept.allReferences()) {
            if (prop.isOptional) {
                optionalParamList.push(`${prop.name}${questionmark}: ${prop.type.name}`);
            } else {
                paramlist.push(`${prop.name}: ${prop.type.name}`);
            }
        }
        return paramlist.concat(optionalParamList).join(", ");
    }

    private createImports(language: PiLanguage) : string {
        // sort all names alphabetically
        let tmp : string[] = [];
        language.concepts.map(c =>
            tmp.push(Names.concept(c))
        );
        language.interfaces.map(c =>
            tmp.push(Names.interface(c))
        );
        tmp = tmp.sort();
    
        // the template starts here
        return `
            ${tmp.map(c => 
                `${c}`
            ).join(", ")}`;
    }
}
