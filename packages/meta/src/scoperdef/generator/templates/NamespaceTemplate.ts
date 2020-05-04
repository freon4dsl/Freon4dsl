import { PiConcept, PiConceptProperty, PiInterface, PiLangExp, PiLanguageUnit } from "../../../languagedef/metalanguage";
import { PiScopeDef, ScopeConceptDef } from "../../metalanguage";
import {
    replaceInterfacesWithImplementors,
    langExpToTypeScript,
    LANGUAGE_GEN_FOLDER,
    Names,
    PROJECTITCORE,
    sortClasses,
    findImplementors
} from "../../../utils";
import { PiElementReference } from "../../../languagedef/metalanguage/PiElementReference";

export class NamespaceTemplate {
    hasAdditionalNamespacetext = '';
    getAdditionalNamespacetext = '';
    additionalNamespaceImports = '';

    generateNamespace(language: PiLanguageUnit, scopedef: PiScopeDef, relativePath: string): string {
        let generateAdditionalNamespaces = false;
        if (scopedef == null) {
            // generating default
            scopedef = new PiScopeDef();
            scopedef.languageName = language.name;
            scopedef.namespaces = [];
            scopedef.namespaces.push(PiElementReference.create<PiConcept>(language.rootConcept, "PiConcept"));
        } else {
            this.makeAdditionalNamespaceTexts(scopedef, language);
            if (this.hasAdditionalNamespacetext.length > 0) generateAdditionalNamespaces = true;
        }

        const allLangConcepts : string = Names.allConcepts(language);
        const langConceptType : string = Names.metaType(language);
        const generatedClassName : string = Names.namespace(language);
        const piNamedElementClassName : string = Names.PiNamedElement;
        const myIfStatement = this.createIfStatement(scopedef);

        // Template starts here
        return `
        import { ${piNamedElementClassName}} from "${PROJECTITCORE}";
        import { ${allLangConcepts}, ${replaceInterfacesWithImplementors(scopedef.namespaces).map(ref => `${ref.name}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${scopedef.namespaces.length == 0? `${language.rootConcept.name}, ` : ``}
             ${langConceptType} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
              
        const anymetatype = "_$anymetatype";

        export class ${generatedClassName} {
            private static allNamespaces: Map<${allLangConcepts}, ${generatedClassName}> = new Map();
        
            private constructor(elem: ${allLangConcepts}) {
                this._myElem = elem;
            }
            
            /**
             * this method ensures that every element in the model has one and only one associated namespace object.
             * the type of element 'elem' should be marked as namespace in the scoper definition
             * @param elem
             */
            public static create(elem: ${allLangConcepts}): ${generatedClassName} {
                if (this.allNamespaces.has(elem)) {
                    return this.allNamespaces.get(elem);
                } else {
                    let result = new ${generatedClassName}(elem);
                    this.allNamespaces.set(elem, result);
                    return result;
                }
            }
            
            /**
             * a convenience method that merges 'list' and 'result', where if an element is present in both,
             * the element in 'list' is discarded
             * @param list
             * @param result
             */
            public static joinResultsWithShadowing(list: ${piNamedElementClassName}[], result: ${piNamedElementClassName}[]) {
                list.forEach((elem) => {
                    // shadow name in outer namespace if it is already present
                    if (!result.includes(elem)) {
                        result.push(elem);
                    }
                });
            }
        
            private _myElem: ${allLangConcepts};
            private searchList: string[] = [];
            public getVisibleElements(metatype?: ${langConceptType}): ${piNamedElementClassName}[] {
                let result: ${piNamedElementClassName}[] = [];
        
                // check whether we are already searching this namespace for a certain type
                if ( this.searchingFor(metatype) ) return [];
        
                // do it
                result = this.getInternalVisibleElements(metatype);
        
                // do additional namespaces
                if (this.hasAdditionalNamespace()) {
                    // join the results
                    ${generatedClassName}.joinResultsWithShadowing(this.addAdditionalNamespaces(metatype), result);
                }
        
                // at end clean searchlist
                this.cleanSearchList(metatype);
                return result;
            }
 
            /**
             * returns the elements that are visible in this namespace only, without regard for additional namespaces
             * @param metatype
             */       
            private getInternalVisibleElements(metatype?: ${langConceptType}): ${piNamedElementClassName}[] {
                let result: ${piNamedElementClassName}[] = [];       
                // for now we push all parts, later public/private annotations can be taken into account 
                ${myIfStatement}       
                return result;
            }
            
            /**
             * Checks whether 'namedElement' is an instance of 'metatype', if so 'namedElement' is added to 'result'.
             * 
             * @param namedElement
             * @param result
             * @param metatype
             */
            private addIfTypeOK(namedElement: ${piNamedElementClassName}, result: ${piNamedElementClassName}[], metatype?: ${langConceptType}) {
                if (metatype) {
                    // TODO add support for inheritance
                    if (namedElement.piLanguageConcept() === metatype) {
                        result.push(namedElement);
                    }
                } else {
                    result.push(namedElement);
                }
            }
        
            /**
             * returns true if there are additional namespaces defined for 'this._myElem' in the scoper definition
             */
            private hasAdditionalNamespace() {
                ${this.hasAdditionalNamespacetext}
                return false;
            }
            
            /**
             * adds the results of the search in additional namespaces as defined in the scoper definition
             * @param metatype
             */
            private addAdditionalNamespaces(metatype?: ${langConceptType}): ${piNamedElementClassName}[] {
                let result: ${piNamedElementClassName}[] = [];
                ${this.getAdditionalNamespacetext}
                return result;
            }
            
            /**
             * returns true if a search in this namespace is already in progress for 'metatype'
             * @param metatype
             */
            private searchingFor(metatype?: ${langConceptType}): boolean {
                let type: string = (!!metatype ? metatype : anymetatype);
                if (this.searchList.includes(type)) {
                    return true;
                } else {
                    this.searchList.push(type);
                }
                return false;
            }
        
             /**
             * removes the 'metatype' from the list of searches that are in progress  
             * @param metatype
             */
            private cleanSearchList(metatype?: ${langConceptType}) {
                let type: string = (!!metatype ? metatype : anymetatype);
                const index = this.searchList.indexOf(type);
                if (index > -1) {
                    this.searchList.splice(index, 1);
                }
            }
        }`;

        this.hasAdditionalNamespacetext = '';
        this.getAdditionalNamespacetext = '';
        this.additionalNamespaceImports = '';
    }

    private createIfStatement(scopedef: PiScopeDef) : string {
        let result : string = "";
        let generatedConcepts: PiConcept[] = [];
        for (let piConcept of scopedef.namespaces) {
            let myClassifier = piConcept.referred;
            let comment = `// based on namespace '${myClassifier.name}'\n`;
            if (myClassifier instanceof PiInterface) {
                for (let implementor of findImplementors(myClassifier)) {
                    if (!generatedConcepts.includes(implementor)) {
                        result = result.concat(this.makeIfForConcept(implementor, comment));
                        generatedConcepts.push(implementor);
                    }
                }
            } else {
                result = result.concat(this.makeIfForConcept(myClassifier, comment));
                generatedConcepts.push(myClassifier);
             }
        }
        return result;
    }

    private makeIfForConcept(piConcept: PiConcept, comment: string): string {
        let result: string = comment;
        result = result.concat("if (this._myElem instanceof " + piConcept.name + ") {");
        // TODO should a namespace includes more then just allParts()?
        for (let part of piConcept.allParts()) {
            for (let allProperty of part.type.referred.allProperties()) {
                if (allProperty.name === "name") {
                    if (part.isList) {
                        result = result.concat(
                            "for (let z of this._myElem." + part.name + ") { this.addIfTypeOK(z, result, metatype);  }"
                        );
                    } else {
                        result = result.concat("this.addIfTypeOK(this._myElem." + part.name + ", result, metatype);");
                    }
                } else {
                    result = result.concat("");
                }
            }
        }
        result = result.concat("}" + "\n");
        return result;
    }

    private makeAdditionalNamespaceTexts(scopedef: PiScopeDef, language: PiLanguageUnit) {
        const generatedClassName : string = Names.namespace(language);
        let generatedConcepts: PiConcept[] = [];
        for (let def of scopedef.scopeConceptDefs) {
            if (!!def.namespaceAdditions) {
                let myClassifier = def.conceptRef.referred;
                let isDone: boolean = false;
                let comment = "// based on namespace addition for " + myClassifier.name + "\n";
                if (myClassifier instanceof PiInterface) {
                    for (let implementor of findImplementors(myClassifier)) {
                        if ( !generatedConcepts.includes(implementor)) {
                            isDone = true;
                        }
                        this.makeAdditionalNamespaceTextsForConcept(implementor, def, language, isDone, comment);
                        generatedConcepts.push(implementor);
                    }
                } else {
                    if ( !generatedConcepts.includes(myClassifier)) {
                        isDone = true;
                    }
                    this.makeAdditionalNamespaceTextsForConcept(myClassifier, def, language, isDone, comment);
                    generatedConcepts.push(myClassifier);
                }
            }
        }
    }

    private makeAdditionalNamespaceTextsForConcept(piConcept: PiConcept, def: ScopeConceptDef, language: PiLanguageUnit, isDone: boolean, comment: string) {
        // we are adding to three textstrings
        // first, to the import statements
        if (isDone) { // do this only if the concept has not yet been imported (indicated by isDone)
            this.additionalNamespaceImports = this.additionalNamespaceImports.concat(", " + piConcept.name);
        }

        // second, to the 'hasAlternativeScope' method
        if (isDone) { // do this only if the concept has not yet been imported (indicated by isDone)
            this.hasAdditionalNamespacetext = this.hasAdditionalNamespacetext.concat(comment);
            this.hasAdditionalNamespacetext = this.hasAdditionalNamespacetext.concat(
                `if (this._myElem instanceof ${piConcept.name}) {
                        return true;
                    }`);
        }

        // third, to the 'getAlternativeScope' method
        // Do this always, because the expression can be different for a concrete concept
        // and the interface that its implements. Both should added!
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(comment);
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(
            `if (this._myElem instanceof ${piConcept.name}) {`);
        for (let expression of def.namespaceAdditions.expressions) {
            this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(this.addNamespaceExpression(expression, language));
        }
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(
            `}`);
    }

    private addNamespaceExpression(expression: PiLangExp, language: PiLanguageUnit): string {
        let result: string = '';
        const generatedClassName : string = Names.namespace(language);
        let myRef = expression.findRefOfLastAppliedFeature();
        let loopVar: string = "loopVariable";
        let loopVarExtended = loopVar;
        if(myRef.isList) {
            if (myRef instanceof PiConceptProperty) {
                if (!myRef.isPart) {
                    loopVarExtended = loopVarExtended.concat(".referred");
                }
            }
            // TODO test list
            result = result.concat(`
            // generated based on '${expression.toPiString()}'
            for (let ${loopVar} of this._myElem.${expression.appliedfeature.toPiString()}) {
                if (!!${loopVarExtended})) {
                    let extraNamespace = ${generatedClassName}.create(${loopVarExtended});
                    ${generatedClassName}.joinResultsWithShadowing(extraNamespace.getVisibleElements(metatype), result);
                }
            }`);
        } else {
            // TODO check use of toPiString()
            result = result.concat(`
               // generated based on '${expression.toPiString()}' 
               if (!!this._myElem.${expression.appliedfeature.toPiString()}) {
                   let extraNamespace = ${generatedClassName}.create(this._myElem.${langExpToTypeScript(expression.appliedfeature)});
                   ${generatedClassName}.joinResultsWithShadowing(extraNamespace.getVisibleElements(metatype), result);               
               }`);
        }
        return result;
    }
}
