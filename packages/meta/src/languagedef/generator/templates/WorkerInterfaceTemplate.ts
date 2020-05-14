import { Names, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiLanguageUnit } from "../../metalanguage/PiLanguage";

export class WorkerInterfaceTemplate {
    constructor() {
    }

    generateWorkerInterface(language: PiLanguageUnit, relativePath: string): string {
        
        // the template starts here
        return `
        import { ${this.createImports(language, )} } from "${relativePath}${LANGUAGE_GEN_FOLDER }"; 

        /**
         * Interface ${Names.workerInterface(language)} implements the extended visitor pattern of instances of language ${language.name}.
         * Class ${Names.walker(language)} implements the traversal of the model tree, classes that implement this interface 
         * are responsible for the actual work being done on the nodes of the tree.
         * Every node is visited twice, once before the visit of its children, and once after this visit.
         */
        export interface ${Names.workerInterface(language)} {

        ${language.concepts.map(concept => 
            `execBefore${concept.name}(modelelement: ${concept.name});
            execAfter${concept.name}(modelelement: ${concept.name});`
        ).join("\n\n") }       
        }`;
    }

    private createImports(language: PiLanguageUnit) : string {
        // sort all names alphabetically
        let tmp : string[] = [];
        language.concepts.map(c =>
            tmp.push(Names.concept(c))
        );
        tmp = tmp.sort();
    
        // the template starts here
        return `
            ${tmp.map(c => 
                `${c}`
            ).join(", ")}`;
    }
}
