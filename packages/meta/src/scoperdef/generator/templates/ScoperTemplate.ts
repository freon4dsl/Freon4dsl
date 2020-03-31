import { Names } from "../../../utils/Names";
import { PathProvider } from "../../../utils/PathProvider";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { PiScopeDef } from "../../metalanguage/PiScopeDefLang";

export class ScoperTemplate {
    constructor() {
    }

    generateScoper(language: PiLanguageUnit, scopedef: PiScopeDef, relativePath: string): string {
        // console.log("Creating Scoper");
        const allLangConcepts : string = Names.allConcepts(language);   
        const langConceptType : string = Names.metaType(language);     
        const generatedClassName : string = Names.scoper(language);
        const namespaceClassName : string = Names.namespace(language);
        const scoperInterfaceName : string = Names.PiScoper;

        // Template starts here
        return `
        import { ${allLangConcepts}, ${langConceptType} } from "${relativePath}${PathProvider.languageFolder}";   
        import { ${namespaceClassName} } from "./${namespaceClassName}";
        import { ${scoperInterfaceName},  ${Names.PiNamedElement} } from "${PathProvider.scoperInterface()}"
        
        export class ${generatedClassName} implements ${scoperInterfaceName} {
            isInScope(modelElement: ${allLangConcepts}, name: string, metatype?: ${langConceptType}, excludeSurrounding? : boolean) : boolean {
                if (this.getFromVisibleElements(modelElement, name, metatype, excludeSurrounding) !== null) {
                    return true;
                } else {
                    return false;
                }
            }
            
            getVisibleElements(modelelement: ${allLangConcepts}, metatype?: ${langConceptType}, excludeSurrounding? : boolean): PiNamedElement[] {
                let result : PiNamedElement[] = [];
                if(modelelement == null){
                    // TODO error mess console.log("getVisibleElements: modelelement is null");
                    return null;
                }
                let ns = new ${namespaceClassName}(modelelement);
                result = ns.getVisibleElements(metatype, excludeSurrounding); // true means that we are excluding names from parent namespaces                   
                return result;
            }
            
            getFromVisibleElements(modelelement: ${allLangConcepts}, name : string, metatype?: ${langConceptType}, excludeSurrounding? : boolean) : PiNamedElement {
                let vis = this.getVisibleElements(modelelement, metatype, excludeSurrounding);
                if (vis !== null) {
                    for (let e of vis) {
                        let n: string = e.name;
                        if (name === n) {
                            return e;
                        }  
                    }
                }    
                return null;
            }
            
            getVisibleNames(modelelement: ${allLangConcepts}, metatype?: ${langConceptType}, excludeSurrounding? : boolean) : string[] {
                let result: string[] = [];
                let vis = this.getVisibleElements(modelelement, metatype, excludeSurrounding);
                for (let e of vis) {
                    let n: string = e.name;
                    result.push(n);                    
                }
                return result;
            }
        }`;
    }

}
