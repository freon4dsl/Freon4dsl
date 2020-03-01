import { PiLanguage } from "../../../metalanguage/PiLanguage";
import { Names } from "../../Names";

export class ScoperInterfaceTemplate {
    constructor() {
    }

    generateScoperInterface(language: PiLanguage) : string {
        const allConceptsName = Names.allConcepts(language);

        return `
            import { ${allConceptsName} } from "./${allConceptsName}";
                        
            export interface I${language.name}Scoper {
                isInScope(modelElement: ${allConceptsName}, name: string, type?: ${allConceptsName}) : boolean;
                getVisibleElements(modelelement: ${allConceptsName}) : ${allConceptsName}[] ;
                getFromVisibleElements(modelelement: ${allConceptsName}, name : string, metatype?: ${allConceptsName}) : ${allConceptsName};
                getVisibleNames(modelelement: ${allConceptsName}) : String[] ;
                getVisibleTypes(modelelement: ${allConceptsName}) : ${allConceptsName}[] ;            
            }
        `;
    }
}
