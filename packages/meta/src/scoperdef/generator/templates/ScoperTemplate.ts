import { PiLangExp, PiLangFunctionCallExp, PiLanguage } from "../../../languagedef/metalanguage";
import {
    Names,
    LANGUAGE_GEN_FOLDER,
    PROJECTITCORE,
    TYPER_GEN_FOLDER,
    PROJECTIT_GEN_FOLDER,
    langExpToTypeScript,
    replaceInterfacesWithImplementors
} from "../../../utils";
import { PiScopeDef } from "../../metalanguage";

export class ScoperTemplate {
    hasAlternativeScopeText: string = "";
    getAlternativeScopeText: string = "";
    alternativeScopeImports: string = "";

    generateIndex(language: PiLanguage): string {
        return `
        export * from "./${Names.scoper(language)}";
        export * from "./${Names.scoperUtils(language)}";
        export * from "./${Names.namespace(language)}";
        export * from "./${Names.namesCollector(language)}";
        `;
    }

    generateScoper(language: PiLanguage, scopedef: PiScopeDef, relativePath: string): string {
        this.hasAlternativeScopeText = "";
        this.getAlternativeScopeText = "";
        this.alternativeScopeImports = "";

        const allLangConcepts: string = Names.allConcepts(language);
        const langConceptType: string = Names.metaType(language);
        const generatedClassName: string = Names.scoper(language);
        const namespaceClassName: string = Names.namespace(language);
        const scoperInterfaceName: string = Names.PiScoper;
        const typerClassName: string = Names.typer(language);

        let generateAlternativeScopes = false;
        if (!!scopedef) { // should always be the case, either the definition read from file or the default
            this.makeAlternativeScopeTexts(scopedef, language);
            if (this.hasAlternativeScopeText.length > 0) {
                generateAlternativeScopes = true;
            }
        }

        // Template starts here
        return `
        import { ${allLangConcepts}, ${langConceptType},
                    ${replaceInterfacesWithImplementors(scopedef.namespaces).map(ref =>
                        `${Names.concept(ref)}`).join(", ")}${this.alternativeScopeImports} 
                } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
        import { ${namespaceClassName} } from "./${namespaceClassName}";
        import { ${scoperInterfaceName},  ${Names.PiNamedElement}, PiLogger, Language } from "${PROJECTITCORE}"
        import { ${Names.environment(language)} } from "${relativePath}${PROJECTIT_GEN_FOLDER}/${Names.environment(language)}";
        import { isNameSpace } from "./${Names.scoperUtils(language)}";
        ${generateAlternativeScopes ? `import { ${typerClassName} } from "${relativePath}${TYPER_GEN_FOLDER}";` : `` }          
                                   
        const LOGGER = new PiLogger("${generatedClassName}");  
        
        /**
         * Class ${generatedClassName} implements the scoper generated from, if present, the scoper definition,
         * otherwise this class implements the default scoper. 
         */      
        export class ${generatedClassName} implements ${scoperInterfaceName} {
            ${generateAlternativeScopes ? `myTyper: ${typerClassName};` : ``}
    
            public resolvePathName(basePosition: ${allLangConcepts}, doNotSearch: string, pathname: string[], metatype?: ${langConceptType}): ${Names.PiNamedElement} {
                // basePosition itself may be an additional namespace; 
                // if so, do not search this namespace, as this will result in a (mobx) cycle
                ${namespaceClassName}.doNotSearch = doNotSearch;
                // get the names from the namespace where the pathname is found (i.e. the basePostion) to be able to check against this later on
                let elementsFromBasePosition: ${Names.PiNamedElement}[] = this.getVisibleElements(basePosition);
                // start the loop over the set of names in the pathname
                let previousFound: ${allLangConcepts} = basePosition;
                let found: ${Names.PiNamedElement} = null;
                for (let index = 0; index < pathname.length; index++) {
                    if (index === pathname.length - 1) { // it is the last name in the path, use 'metatype'
                        found = this.getFromVisibleElements(previousFound, pathname[index], metatype);
                    } else {
                        // search the next name of pathname in the namespace of 'previousFound'
                        // but do not use the metatype information, because only the element with the last of the pathname will have the correct type
                        found = this.getFromVisibleElements(previousFound, pathname[index]);
                        if (found === null || found === undefined || !isNameSpace(found as ${allLangConcepts})) {
                            return null;
                        }
                        previousFound = found as ${allLangConcepts};
                    }
                    // check if 'found' is public or 'found' is in the namespace of the basePosition
                    if (!this.isPublic(found) && !elementsFromBasePosition.includes(found)) {
                        return null;
                    }
                }
                // do not forget to clear 'doNotSearch'; it is a static and might be used again!
                ${namespaceClassName}.doNotSearch = null;
                return found;
            }
 
            private isPublic(found: PiNamedElement) : boolean {
                // find the information about whether this element is public or private within its parent from the its container:
                // 1. check the language description to find the concept description of the parent
                // 2. from the parent find the property description with the right name
                // 3. check whether the found property is public
                if (found === null || found === undefined) {
                    return false;
                }
                const container = found.piContainer();
                if (container === null || container === undefined) {
                    return false;
                }
                const metaType: string = container.container.piLanguageConcept();
                if (metaType === "${Names.classifier(language.modelConcept)}" ) {
                    return true; // model only has units as properties, all units are public
                } else ${language.units.map(u => ` if (metaType === "${Names.classifier(u)}") {
                    return Language.getInstance().unit(metaType).properties.get(container.propertyName).isPublic;
                } else`).join("")} {
                    return Language.getInstance().concept(metaType).properties.get(container.propertyName).isPublic;
                }
            }   
                    
            /**
             * See ${scoperInterfaceName}.
             */
            public getVisibleElements(modelelement: ${allLangConcepts}, metatype?: ${langConceptType}, excludeSurrounding? : boolean): ${Names.PiNamedElement}[] {
                ${generateAlternativeScopes ? `this.myTyper = ${Names.environment(language)}.getInstance().typer as ${typerClassName};` : ``}
                let result: ${Names.PiNamedElement}[] = this.getElementsFromStdlib(metatype);
                if (!!modelelement) {
                    let doSurrouding: boolean = !(!(excludeSurrounding === undefined) && excludeSurrounding);
                    let nearestNamespace: ${namespaceClassName};
                    // first, see if we need to use an alternative scope/namespace
                    if (this.hasAlternativeScope(modelelement)) {
                        nearestNamespace = this.getAlternativeScope(modelelement);
                        // do not search surrounding namespaces for alternative scopes
                        doSurrouding = false;
                    } else {
                        nearestNamespace = this.findNearestNamespace(modelelement);
                    }
                    // second, get the elements from the found namespace
                    if (!!nearestNamespace) {
                        result = result.concat(nearestNamespace.getVisibleElements(metatype));
                    }
            
                    // third, get the elements from any surrounding namespaces
                    let parentElement = this.getParent(modelelement);
                    while (doSurrouding) {
                        const parentNamespace = this.findNearestNamespace(parentElement);
                        if (!!parentNamespace) {
                            // join the results with shadowing
                            ${namespaceClassName}.joinResultsWithShadowing(parentNamespace.getVisibleElements(metatype), result);
                            parentElement = this.getParent(parentElement);
                        } else {
                            doSurrouding = false;
                        }
                    }
                } else {
                    LOGGER.error(this, "getVisibleElements: modelelement is null");
                    return result;
                }
                return result;
            }
        
            /**
             * See ${scoperInterfaceName}.
             */
            public getFromVisibleElements(modelelement: ${allLangConcepts}, name : string, metatype?: ${langConceptType}, excludeSurrounding? : boolean) : ${Names.PiNamedElement} {
                const visibleElements = this.getVisibleElements(modelelement, metatype, excludeSurrounding);
                if (visibleElements !== null) {
                    for (const element of visibleElements) {
                        const n: string = element.name;
                        if (name === n) {
                            return element;
                        }  
                    }
                }    
                return null;
            }
            
            /**
             * See ${scoperInterfaceName}.
             */
            public getVisibleNames(modelelement: ${allLangConcepts}, metatype?: ${langConceptType}, excludeSurrounding? : boolean) : string[] {
                const result: string[] = [];
                const visibleElements = this.getVisibleElements(modelelement, metatype, excludeSurrounding);
                for (const element of visibleElements) {
                    const n: string = element.name;
                    result.push(n);                    
                }
                return result;
            }
            
            /**
             * See ${scoperInterfaceName}.
             */
            public isInScope(modelElement: ${allLangConcepts}, name: string, metatype?: ${langConceptType}, excludeSurrounding? : boolean) : boolean {
                return this.getFromVisibleElements(modelElement, name, metatype, excludeSurrounding) !== null;
            }
            
             /**
             * Returns the enclosing namespace for 'modelelement'.
             * @param modelelement
             */
            private findNearestNamespace(modelelement: ${allLangConcepts}): ${namespaceClassName} {
                if (modelelement === null) {
                    return null;
                }
                if (isNameSpace(modelelement)) {
                    return ${namespaceClassName}.create(modelelement);
                } else {
                    return this.findNearestNamespace(this.getParent(modelelement));
                }
            }
               
            /**
             * Returns the element in the abstract syntax tree that contains 'modelelement'.
             * @param modelelement
             */
            private getParent(modelelement: ${allLangConcepts}): ${allLangConcepts} {
                let parent: ${allLangConcepts} = null;
                if (modelelement.piContainer() !== null) {
                    if (modelelement.piContainer().container !== null) {
                        // if (modelelement.piContainer().container instanceof ${allLangConcepts}) {
                        parent = modelelement.piContainer().container as ${allLangConcepts};
                        // }
                    }
                }
                return parent;
            }
        
             /**
             * Returns the namespace to be used as alternative scope for 'modelelement'.
             * @param modelelement
             */
            private getAlternativeScope(modelelement: ${allLangConcepts}): ${namespaceClassName} {
                ${this.getAlternativeScopeText}
                return null;
            }
        
             /**
             * Returns true if there is an alternative scope defined for this 'modelelement'.
             * @param modelelement
             */
            private hasAlternativeScope(modelelement: ${allLangConcepts}): boolean {
                ${this.hasAlternativeScopeText}
                return false;
            }
            
             /**
             * Returns all elements that are in the standard library, which types equal 'metatype'.
             * @param metatype
             */           
            private getElementsFromStdlib(metatype?: ${langConceptType}): ${Names.PiNamedElement}[] {
                if (!!metatype) {
                    return ${Names.environment(language)}.getInstance().stdlib.elements.filter((elem) => elem.piLanguageConcept() === metatype ||
                            Language.getInstance().subConcepts(metatype).includes(elem.piLanguageConcept()));
                } else {
                    return ${Names.environment(language)}.getInstance().stdlib.elements;
                }
            }
        }`;
    }

    private makeAlternativeScopeTexts(scopedef: PiScopeDef, language: PiLanguage) {
        const allLangConcepts: string = Names.allConcepts(language);
        for (const def of scopedef.scopeConceptDefs) {
            if (!!def.alternativeScope) {
                const conceptName = def.conceptRef.referred.name;
                // we are adding to three textstrings
                // first, to the import statements
                this.alternativeScopeImports = this.alternativeScopeImports.concat(", " + conceptName);

                // second, to the 'hasAlternativeScope' method
                this.hasAlternativeScopeText = this.hasAlternativeScopeText.concat(
                    `if (!!modelelement && modelelement instanceof ${conceptName}) {
                        return true;
                     }`);

                // third, to the 'getAlternativeScope' method
                this.getAlternativeScopeText = this.getAlternativeScopeText.concat(
                    `if (!!modelelement && modelelement instanceof ${conceptName}) {
                        // use alternative scope '${def.alternativeScope.expression.toPiString()}'
                        ${this.altScopeExpToTypeScript(def.alternativeScope.expression, allLangConcepts, language)}
                    }`);
            }
        }
    }

    private altScopeExpToTypeScript(expression: PiLangExp, allLangConcepts: string, language: PiLanguage): string {
        let result = "";
        // special case: the expression refers to 'typeof'
        if (expression instanceof PiLangFunctionCallExp && expression.sourceName === "typeof") {
            let actualParamToGenerate: string = "";
            // we know that typeof has exactly 1 actual parameter
            if ( expression.actualparams[0].sourceName === "container" ) {
                actualParamToGenerate = `modelelement.piContainer().container as ${allLangConcepts}`;
            } else {
                actualParamToGenerate = langExpToTypeScript(expression.actualparams[0]);
            }
            result = `let container = ${actualParamToGenerate};
                if (!!container) {
                    let newScopeElement = this.myTyper.inferType(${actualParamToGenerate});
                    return ${Names.namespace(language)}.create(newScopeElement);
                }`;
        } else {
            // normal case: the expression is an ordinary expression over the language
            result = langExpToTypeScript(expression);
        }
        return result;
    }
}
