import { Names, PathProvider, PROJECTITCORE, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { PiScopeDef } from "../../metalanguage/PiScopeDefLang";

export class NamespaceTemplate {
    constructor() {
    }

    generateNamespace(language: PiLanguageUnit, scopedef: PiScopeDef, relativePath: string): string {

        if (scopedef == null) {
            scopedef = new PiScopeDef();
            scopedef.languageName = language.name;
            scopedef.namespaces = [];
        }
        
        // console.log("Creating Namespace");
        const allLangConcepts : string = Names.allConcepts(language);   
        const langConceptType : string = Names.metaType(language);     
        const generatedClassName : string = Names.namespace(language);
        const piNamedElementClassName : string = Names.PiNamedElement;
        let myIfStatement = this.createIfStatement(scopedef);

        // Template starts here
        return `
        import { ${allLangConcepts}, ${scopedef.namespaces.map(ns => 
            `${ns.conceptRefs.map(ref => `${ref.name}`)}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${scopedef.namespaces.length == 0? `${language.rootConcept().name}, ` : ``}
             ${langConceptType} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${Names.PiNamedElement}} from "${PROJECTITCORE}";

        export class ${generatedClassName} {
            _myElem : ${allLangConcepts}; // any element in the model
        
            constructor(elem : ${allLangConcepts}) {
                this._myElem = elem;
            }
        
            // if excludeSurrounding is true, then the elements from all parent namespaces are 
            // not included in the result
            public getVisibleElements(metatype?: ${langConceptType}, excludeSurrounding?: boolean) : ${piNamedElementClassName}[] {
                let result : ${piNamedElementClassName}[] = [];
                // from modelelement get its surrounding namespace
                let ns = this.getSurroundingNamespace(this._myElem);
                if (ns !== null) {
                    result = ns.internalVis(metatype); 
                }
                if(!(!(excludeSurrounding === undefined) && excludeSurrounding)) { 
                    // add elements from surrounding Namespaces
                    let parent: ${allLangConcepts} = this.getParent(this._myElem);
                    while (parent !== null) { 
                        ns = this.getSurroundingNamespace(parent);
                        if (ns !== null) {
                            // join the results
                            ns.internalVis(metatype).forEach( elem => { 
                                // shadow name in outer namespace if it is already present
                                if(!result.includes(elem)) result.push(elem);
                            });
                        }
                        // skip modelelements between parent and the modelelement that is its surrounding namespace
                        parent = this.getParent(ns._myElem);
                    }
                }
                return result;
            }
        
            private internalVis(metatype?: ${langConceptType}): ${piNamedElementClassName}[] {
                let result : ${piNamedElementClassName}[] = [];
        
                // for now we push all parts, later public/private annotations need to be taken into account 
                ${myIfStatement}       
                return result;
            }
        
            private getSurroundingNamespace(modelelement: ${allLangConcepts}) : ${generatedClassName} {
                if(modelelement === null){
                    return null;
                }
                if (this.isNameSpace(modelelement)) {
                    return new ${generatedClassName}(modelelement);
                } else {
                     return this.getSurroundingNamespace(this.getParent(modelelement));
                }
            }
        
            private isNameSpace(modelelement : ${allLangConcepts}) : boolean {
                // if-statement generated for each concept marked with @namespace annotation!
                ${scopedef.namespaces.map(ns => `
                    ${ns.conceptRefs.map(ref => `if(modelelement instanceof ${ref.name}) return true;`).join("\n")}
                `)}
                ${scopedef.namespaces.length == 0?
                `if(modelelement instanceof ${language.rootConcept().name}) return true;` : ``}              
                return false;
            }
        
            private getParent(modelelement : ${allLangConcepts}) : ${allLangConcepts} {
                // should be moved to PiElement
                let parent: ${allLangConcepts} = null;
                if (modelelement.piContainer() !== null) {
                    if (modelelement.piContainer().container !== null) {
                        // if (modelelement.piContainer().container instanceof ${allLangConcepts}) {
                            parent = (modelelement.piContainer().container as ${allLangConcepts});
                        // }
                    }
                }
                return parent;
            }

            private addIfTypeOK(z: ${piNamedElementClassName}, result: ${piNamedElementClassName}[], metatype?: ${langConceptType}) {
                if (metatype) {
                    if (z.piLanguageConcept() === metatype) {
                        result.push(z);
                    }
                } else {
                    result.push(z);
                }
            }        
        
        }`;
    }

    private createIfStatement(scopedef: PiScopeDef) : string {
        let result : string = "";
        for (let ns of scopedef.namespaces) {
            for(let ref of ns.conceptRefs) {
                result = result.concat("if (this._myElem instanceof " + ref.name + ") {")
                for (let part of ref.referedElement().allParts() ) { 
                    for (let kk of part.type.referedElement().allProperties()) {          
                        if (kk.name === "name") {
                            if (part.isList) { 
                                result = result.concat(
                                    "for (let z of this._myElem." + part.name + ") { this.addIfTypeOK(z, result, metatype);  }"
                                );
                            } else {
                                result = result.concat("this.addIfTypeOK(this._myElem." + part.name + ", result, metatype);")
                            }
                        } else {
                            result = result.concat("");
                        }
                    }
                }
                result = result.concat("}\n");
            }
        }
        return result;
    }
}
