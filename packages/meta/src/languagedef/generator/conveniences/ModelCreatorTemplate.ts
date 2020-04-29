import { Names } from "../../../utils/Names";
import { LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiConcept, PiLanguageUnit } from "../../metalanguage/PiLanguage";

export class ModelCreatorTemplate {
    constructor() {
    }

    generateModelCreator(language: PiLanguageUnit, relativePath: string): string {
        // TODO use Names for class name
        
        // the template starts here
        return `
        import { ${this.createImports(language)}, ${Names.PiElementReference} } from "${relativePath}${LANGUAGE_GEN_FOLDER}"; 

        export class ${language.name}Creator {

        ${language.concepts.map(concept => 
            `${concept.isAbstract? `` : 
            `public create${concept.name}(${this.makeParams(concept)}) : ${concept.name} {
                let _result = new ${concept.name}();
                ${concept.allPrimProperties().map(prop => 
                    `_result.${prop.name} = ${prop.name}`
                ).join(";")} 
                ${concept.allParts().map(prop => 
                `${prop.isList? `if(${prop.name} !== null) _result.${prop.name}.push(${prop.name});` 
                    : 
                    `_result.${prop.name} = ${prop.name};`}`
                ).join("\n")}
                ${concept.allReferences().map(prop => 
                `${prop.isList? `if(${prop.name} !== null) _result.${prop.name}.push(new ${Names.PiElementReference}(${prop.name}, "${prop.type.name}"));` 
                    : 
                    `_result.${prop.name} = new ${Names.PiElementReference}(${prop.name}, "${prop.type.name}");`}`
                ).join("\n")}
                return _result;
            }`
        }`).join("\n") }
        }`;
    }

    private makeParams(concept: PiConcept) : string {
        // TODO would like to use allProperties() here, but PrimProperties give error
        let paramlist: string[] = [];
        for (let prop of concept.allPrimProperties()) {
            let questionmark = (prop.isOptional ? `?` : ``);
            paramlist.push(`${prop.name}${questionmark}: ${prop.primType}`);
        }
        for (let prop of concept.allParts()) {
            let questionmark = (prop.isOptional ? `?` : ``);
            paramlist.push(`${prop.name}${questionmark}: ${prop.type.name}`);
        }
        for (let prop of concept.allReferences()) {
            let questionmark = (prop.isOptional ? `?` : ``);
            paramlist.push(`${prop.name}${questionmark}: ${prop.type.name}`);
        }
        return paramlist.join(", ");
        // return `${concept.allParts().map(prop =>
        //     `${prop.name}: ${prop.type.name}`).concat(`${concept.allReferences().map(prop =>
        //     `${prop.name}: ${prop.type.name}`)}`).concat(`${concept.allPrimProperties().map(prop =>
        //     `${prop.name}: ${prop.primType}`)}`).join(", ")}`;
    }

    private createImports(language: PiLanguageUnit) : string {
        // sort all names alphabetically
        let tmp : string[] = [];
        language.concepts.map(c =>
            tmp.push(Names.concept(c))
        );
        language.interfaces.map(c =>
            tmp.push(Names.interface(c))
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
