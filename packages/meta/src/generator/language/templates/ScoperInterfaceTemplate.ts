import { PiLanguage } from "../../../metalanguage/PiLanguage";
import { Names } from "../../Names";

export class ScoperInterfaceTemplate {
    constructor() {
    }

    generateScoperInterface(language: PiLanguage) : string {
        const allConceptsName = Names.allConcepts(language);
        const conceptType = Names.languageConceptType(language);

        return `
            import { ${allConceptsName} } from "./${allConceptsName}";
            import { ${conceptType} } from "./${language.name}";
                        
            export interface I${language.name}Scoper {
                isInScope(modelElement: ${allConceptsName}, name: string, metatype?: ${conceptType}) : boolean;
                getVisibleElements(modelelement: ${allConceptsName}) : ${allConceptsName}[] ;
                getFromVisibleElements(modelelement: ${allConceptsName}, name : string, metatype?: ${conceptType}) : ${allConceptsName};
                getVisibleNames(modelelement: ${allConceptsName}) : String[] ;
                getVisibleTypes(modelelement: ${allConceptsName}) : ${allConceptsName}[] ;            
            }
        `;
    }
}
