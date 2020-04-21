import { Names } from "../../../utils/Names";
import { PathProvider, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiLanguageUnit, PiLangClass } from "../../metalanguage/PiLanguage";
import * as os from 'os';

export class ModelCreatorTemplate {
    constructor() {
    }

    generateModelCreator(language: PiLanguageUnit, relativePath: string): string {
        // TODO use Names for class name
        
        // the template starts here
        return `
        import { ${this.createImports(language)}, ${Names.PiElementReference} } from "${relativePath}${LANGUAGE_GEN_FOLDER}"; 

        export class ${language.name}Creator {

        ${language.classes.map(concept => 
            `${concept.isAbstract? `` : 
            `public create${concept.name}(${this.makeParams(concept)}) : ${concept.name} {
                let _result = new ${concept.name}();
                ${concept.allPrimProperties().map(prop => 
                `_result.${prop.name} = ${prop.name}`
                ).join(";")}
                ${concept.allEnumProperties().map(prop => 
                    `_result.${prop.name} = ${prop.name}`
                    ).join(";")}    
                ${concept.allParts().map(prop => 
                `${prop.isList? `if(${prop.name} !== null) _result.${prop.name}.push(${prop.name});` 
                    : 
                    `_result.${prop.name} = ${prop.name};`}`
                ).join(os.EOL)}
                ${concept.allPReferences().map(prop => 
                `${prop.isList? `if(${prop.name} !== null) _result.${prop.name}.push(new ${Names.PiElementReference}(${prop.name}, "${prop.type.name}"));` 
                    : 
                    `_result.${prop.name} = new ${Names.PiElementReference}(${prop.name}, "${prop.type.name}");`}`
                ).join(os.EOL)}
                return _result;
            }`
        }`).join(os.EOL) }
        }`;
    }

    private makeParams(concept: PiLangClass) : string {
        return `${concept.allProperties().map(prop => 
            `${prop.name}: ${prop.type.name}`).join(", ")}`;
    }

    private createImports(language: PiLanguageUnit) : string {
        // sort all names alphabetically
        let tmp : string[] = [];
        language.classes.map(c => 
            tmp.push(Names.concept(c))
        );
        language.enumerations.map(c =>
            tmp.push(Names.enumeration(c))
        );
        language.unions.map(c =>
            tmp.push(Names.union(c))
        );
        tmp = tmp.sort();
    
        // the template starts here
        return `
            ${tmp.map(c => 
                `${c}`
            ).join(", ")}`;
    }
}
