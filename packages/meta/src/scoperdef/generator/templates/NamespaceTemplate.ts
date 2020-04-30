import { Names, PathProvider, PROJECTITCORE, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiConceptProperty, PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { PiScopeDef } from "../../metalanguage/PiScopeDefLang";
import { langExpToTypeScript } from "../../../utils";

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
        let myExtras = this.createExtras(scopedef, generatedClassName);

        // Template starts here
        return `
        import { ${allLangConcepts}, ${scopedef.namespaces.map(ref => `${ref.name}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${scopedef.namespaces.length == 0? `${language.rootConcept.name}, ` : ``}
             ${langConceptType} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${Names.PiNamedElement}} from "${PROJECTITCORE}";

        export class ${generatedClassName} {
            _myElem : ${allLangConcepts}; // any element in the model
            _searched: ${allLangConcepts}[] = [];
        
            constructor(elem : ${allLangConcepts}, searched?: ${allLangConcepts}[]) {
                this._myElem = elem;
                if (!!searched) {
                    this._searched = searched;
                }
            }
        
            // if excludeSurrounding is true, then the elements from all parent namespaces are 
            // not included in the result
            public getVisibleElements(metatype?: ${langConceptType}, excludeSurrounding?: boolean) : ${piNamedElementClassName}[] {
                let result : ${piNamedElementClassName}[] = [];
                // from modelelement get its surrounding namespace
                let ns = this.getSurroundingNamespace(this._myElem);
                if (ns !== null) {
                    result = ns.internalVis(metatype); 
                    this._searched.push(this._myElem);
                    // add extra namespaces from the scope definition
                    result = result.concat(this.addExtras(metatype, excludeSurrounding)); 
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
                            // add extra namespaces from the scope definition
                            this._searched.push(ns._myElem);
                            result = result.concat(ns.addExtras(metatype, excludeSurrounding));
                        }
                        // skip modelelements between parent and the modelelement that is its surrounding namespace
                        parent = this.getParent(parent);
                    }
                }
                return result;
            }
        
            private internalVis(metatype?: ${langConceptType}): ${piNamedElementClassName}[] {
                let result : ${piNamedElementClassName}[] = [];
        
                // for now we push all parts, later public/private annotations can be taken into account 
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
                ${scopedef.namespaces.map(ref => `if(modelelement instanceof ${ref.name}) return true;`).join("\n")}
                ${scopedef.namespaces.length == 0?
                `if(modelelement instanceof ${language.rootConcept.name}) return true;` : ``}              
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
            
            private addExtras(metatype?: ${langConceptType}, excludeSurrounding?: boolean): ${piNamedElementClassName}[] {
                let result: PiNamedElement[] = [];
                // add names from other parts of the namespace definition
                ${myExtras}
                return result;
            }      
        }`;
    }

    private createIfStatement(scopedef: PiScopeDef) : string {
        let result : string = "";
        for (let ref of scopedef.namespaces) {
            result = result.concat("if (this._myElem instanceof " + ref.name + ") {")
            for (let part of ref.referred.allParts() ) {
                for (let kk of part.type.referred.allProperties()) {
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
            result = result.concat("}" + "\n");
        }
        return result;
    }

    private createExtras(scopedef: PiScopeDef, generatedClassName: string): string {
        let result: string = '';
        for(let e of scopedef.scopeConceptDefs) {
            if(!!e.namespaceAdditions) {
                let con = e.conceptRef.referred.name;
                result = result.concat(`if (this._myElem instanceof ${con}) {`);
                for(let xx of e.namespaceAdditions.expressions) {
                    let myRef = xx.findRefOfLastAppliedFeature();
                    let loopVar: string = "yy";
                    let loopVarExtended = loopVar;
                    if(myRef.isList) {
                        if (myRef instanceof PiConceptProperty) {
                            if (!myRef.isPart) {
                                loopVarExtended = loopVarExtended.concat(".referred");
                            }
                        }
                        result = result.concat(`
                        // generated based on '${xx.toPiString()}'
                        for (let ${loopVar} of this._myElem.${xx.appliedfeature.toPiString()}) {
                            if (!this._searched.includes(${loopVarExtended}.${langExpToTypeScript(xx.appliedfeature)}) ) {
                                if (this.isNameSpace(${loopVarExtended})) {
                                    // wrap the found element
                                    let extraNamespace = new ${generatedClassName}(${loopVarExtended}, this._searched);
                                    result = result.concat(extraNamespace.getVisibleElements(metatype, excludeSurrounding));
                                    this._searched.push(${loopVarExtended}.${langExpToTypeScript(xx.appliedfeature)});
                                }
                            }
                        }`);
                    } else {
                        result = result.concat(`
                        // generated based on '${xx.toPiString()}' 
                        if (!!this._myElem.${xx.appliedfeature.toPiString()}) {
                            if (!this._searched.includes(this._myElem.${langExpToTypeScript(xx.appliedfeature)}) ) {
                                if (this.isNameSpace(this._myElem.${langExpToTypeScript(xx.appliedfeature)})) {
                                    // wrap the found element
                                    let extraNamespace = new ${generatedClassName}(this._myElem.${langExpToTypeScript(xx.appliedfeature)}, this._searched);
                                    result = result.concat(extraNamespace.getVisibleElements(metatype, excludeSurrounding));
                                    this._searched.push(this._myElem.${langExpToTypeScript(xx.appliedfeature)});
                                }  
                            }                
                        }`);
                    }
                }
                result = result.concat("}");
            }
        }

    // private addExtras(metatype?: DemoConceptType, excludeSurrounding?: boolean): PiNamedElement[] {
    //         let result: PiNamedElement[] = [];
    //         // add names from other parts of the namespace definition
    //         if (this._myElem instanceof DemoEntity) {
    //             if (!!this._myElem.baseEntity) {
    //                 if (this.isNameSpace(this._myElem.baseEntity.referred)) {
    //                     // wrap the found element
    //                     let extraNamespace = new DemoNamespace(this._myElem.baseEntity.referred);
    //                     result = result.concat(extraNamespace.getVisibleElements(metatype, excludeSurrounding));
    //                 }
    //             }
    //         }
    //         return result;
    //     }

        return result;
    }

}
