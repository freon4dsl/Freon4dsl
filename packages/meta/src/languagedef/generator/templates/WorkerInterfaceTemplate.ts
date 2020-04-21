import { Names, PathProvider, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiLanguageUnit } from "../../metalanguage/PiLanguage";
import * as os from 'os';

export class WorkerInterfaceTemplate {
    constructor() {
    }

    generateWorkerInterface(language: PiLanguageUnit, relativePath: string): string {
        
        // the template starts here
        return `
        import { ${this.createImports(language, )} } from "${relativePath}${LANGUAGE_GEN_FOLDER }"; 

        export interface ${Names.workerInterface(language)} {

        ${language.classes.map(concept => 
            `execBefore${concept.name}(modelelement: ${concept.name});
            execAfter${concept.name}(modelelement: ${concept.name});`
        ).join(os.EOL + os.EOL) }

        ${language.enumerations.map(concept => 
            `execBefore${concept.name}(modelelement: ${concept.name});
            execAfter${concept.name}(modelelement: ${concept.name});`
        ).join(os.EOL + os.EOL) }
        
        }`;
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
