import { Names } from "../../../utils/Names";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { PiScopeDef } from "../../metalanguage/PiScopeDefLang";

export class ScoperTemplate {
    constructor() {
    }

    generateScoper(language: PiLanguageUnit, scopedef: PiScopeDef): string {
        // console.log("Creating Scoper");
        const allLangConcepts : string = Names.allConcepts(language);   
        const langConceptType : string = Names.languageConceptType(language);     
        const generatedClassName : string = Names.scoper(language, scopedef);
        const namespaceClassName : string = Names.namespace(language, scopedef);

        // Template starts here
        return `
        import { ${allLangConcepts} } from "../../language";
        import { ${langConceptType} } from "../../language/${language.name}";        
        import { ${namespaceClassName} } from "./${namespaceClassName}";
        import { PiScoper, PiNamedElement } from "@projectit/core"
        
        export class ${generatedClassName} implements PiScoper {
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
            tmp.push(Names.type(c))
        );
        tmp = tmp.sort();
    
        // the template starts here
        return `
            ${tmp.map(c => 
                `${c}`
            ).join(", ")}`;
    }

}
