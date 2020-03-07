import { Names } from "../../Names";
import { PiLanguage } from "../../../metalanguage/PiLanguage";
import { PiScopeDef } from "../../../metalanguage/scoper/PiScopeDefLang";

export class ScoperTemplate {
    constructor() {
    }

    generateScoper(language: PiLanguage, scopedef: PiScopeDef): string {
        console.log("Creating Scoper");
        const allLangConcepts : string = Names.allConcepts(language);   
        const langConceptType : string = Names.languageConceptType(language);     
        const generatedClassName : String = Names.scoper(language, scopedef);
        const namespaceClassName : String = Names.namespace(language, scopedef);
        const scoperInterfaceName : String = Names.scoperInterface(language);

        // TODO removed DemoAttribute and DemoVariable
        // Template starts here
        return `
        import { ${allLangConcepts}, ${scoperInterfaceName}, ${scopedef.namespaces.map(ns => `
        ${ns.conceptRefs.map(ref => `${ref.name}`)}`).join(", ")}, DemoVariable, DemoAttribute } from "../../language";
        import { ${langConceptType} } from "../../language/${language.name}";        
        import { ${namespaceClassName} } from "./${namespaceClassName}";
        
        export class ${generatedClassName} implements ${scoperInterfaceName} {
            isInScope(modelElement: ${allLangConcepts}, name: string, metatype?: ${langConceptType}, excludeSurrounding? : boolean) : boolean {
                if (this.getFromVisibleElements(modelElement, name, metatype, excludeSurrounding) !== null) {
                    return true;
                } else {
                    return false;
                }
            }
            
            getVisibleElements(modelelement: ${allLangConcepts}, metatype?: ${langConceptType}, excludeSurrounding? : boolean): ${allLangConcepts}[] {
                let result : ${allLangConcepts}[] = [];
                if(modelelement == null){
                    // TODO error mess console.log("getVisibleElements: modelelement is null");
                    return null
                }
                let ns = new ${namespaceClassName}(modelelement);
                result = ns.getVisibleElements(metatype, excludeSurrounding); // true means that we are excluding names from parent namespaces                   
                return result;
            }
            
            getFromVisibleElements(modelelement: ${allLangConcepts}, name : string, metatype?: ${langConceptType}, excludeSurrounding? : boolean) : ${allLangConcepts} {
                let vis = this.getVisibleElements(modelelement, metatype, excludeSurrounding);
                if (vis !== null) {
                    for (let e of vis) {
                        let n: string = this.getNameOfConcept(e);
                        if (name === n) {
                            return e;
                        }  
                    }
                }    
                return null;
            }
            
            getVisibleNames(modelelement: ${allLangConcepts}, metatype?: ${langConceptType}, excludeSurrounding? : boolean) : String[] {
                let result: String[] = [];
                let vis = this.getVisibleElements(modelelement, metatype, excludeSurrounding);
                for (let e of vis) {
                    let n: string = this.getNameOfConcept(e);
                        result.push(n);
                    }
                    return result;
                }
            
            // TODO Should be moved!!
            private getNameOfConcept(modelelement: ${allLangConcepts}) {
                let name: string = ""
                modelelement.propertyName
                if (modelelement instanceof DemoAttribute) {
                    name = modelelement.name;
                } else if (modelelement instanceof DemoEntity) {
                    name = modelelement.name;
                } else if (modelelement instanceof DemoFunction) {
                    name = modelelement.name;
                } else if (modelelement instanceof DemoVariable) {
                    name = modelelement.name;
                }
                else if (modelelement instanceof DemoModel) {
                    name = modelelement.name;
                }
                else {
                    name = modelelement.$id;
                }
                return name;
            }
        }`;
    }
}