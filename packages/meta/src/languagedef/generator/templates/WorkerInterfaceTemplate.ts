import { Names } from "../../../utils/Names";
import { PiLanguageUnit, PiLangConcept } from "../../metalanguage/PiLanguage";
import { PiLangThisExp, PiLangExp, PiLangEnumExp } from "../../metalanguage/PiLangExpressions";

export class WorkerInterfaceTemplate {
    constructor() {
    }

    generateWorkerInterface(language: PiLanguageUnit): string {
        
        // the template starts here
        return `
        import { ${this.createImports(language, )} } from "../../language"; 

        export interface ${Names.workerInterface(language)} {

        ${language.classes.map(concept => 
            `execBefore${concept.name}(modelelement: ${concept.name});
            execAfter${concept.name}(modelelement: ${concept.name});`
        ).join("\n\n") }
        
        }`;
    }

    private createImports(language: PiLanguageUnit) : string {
        let result : string = "";
        result = language.classes?.map(concept => `
                ${concept.name}`).join(", ");
        result = result.concat(language.classes? `,` :``);
        return result;
    }
}
