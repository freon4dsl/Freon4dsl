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

                // isInScope returns true if 'name' is known in the namespace containing 'modelelement' or one 
                // of its surrounding namespaces.
                // When parameter 'metatype' is present, it returns true if the element named 'name'
                // is an instance of 'metatype'. There is no default setting for this parameter.
                // When parameter 'excludeSurrounding' is present, it returns true if the element named 'name'
                // is known in the namespace containing 'modelelement', without looking in surrounding namespaces.
                isInScope(modelElement: ${allConceptsName}, name: string, metatype?: ${conceptType}, excludeSurrounding?: boolean) : boolean;

                // getVisibleElements returns all elements that are visible in the namespace containing 'modelelement' or one 
                // of its surrounding namespaces.
                // When parameter 'metatype' is present, it returns all elements that are an instance of 'metatype'. 
                // There is no default setting for this parameter.
                // When parameter 'excludeSurrounding' is present, it returns all elements that are visible in 
                // either the namespace containing 'modelelement', without looking in surrounding namespaces. Elements in 
                // surrounding namespaces are shadowed by elements with the same name in an inner namespace.
                getVisibleElements(modelelement: ${allConceptsName}, metatype?: ${conceptType}, excludeSurrounding?: boolean) : ${allConceptsName}[] ;
                
                // getFromVisibleElements returns the element named 'name' which is visible in the namespace containing 'modelelement' or one 
                // of its surrounding namespaces.
                // When parameter 'metatype' is present, it returns the element that is an instance of 'metatype'. 
                // There is no default setting for this parameter.
                // When parameter 'excludeSurrounding' is present, it returns the element that is visible in 
                // either the namespace containing 'modelelement', without looking in surrounding namespaces. Elements in 
                // surrounding namespaces are shadowed by elements with the same name in an inner namespace.              
                getFromVisibleElements(modelelement: ${allConceptsName}, name : string, metatype?: ${conceptType}, excludeSurrounding?: boolean) : ${allConceptsName};

                // getVisibleNames does the same as getVisibleElements, only it does not return the elements,
                // but the names of the elements
                getVisibleNames(modelelement: ${allConceptsName}, metatype?: ${conceptType}, excludeSurrounding?: boolean) : String[] ;        
            }
        `;
    }
}
