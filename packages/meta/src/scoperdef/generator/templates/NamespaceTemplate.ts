import { PiConcept, PiConceptProperty, PiInterface, PiLangExp, PiLanguage } from "../../../languagedef/metalanguage";
import { PiScopeDef, ScopeConceptDef } from "../../metalanguage";
import {
    langExpToTypeScript,
    LANGUAGE_GEN_FOLDER,
    Names,
    PROJECTITCORE,
    LangUtil,
    LANGUAGE_UTILS_GEN_FOLDER
} from "../../../utils";

export class NamespaceTemplate {
    hasAdditionalNamespacetext = "";
    getAdditionalNamespacetext = "";
    additionalNamespaceImports = "";
    imports: string[] = [];

    generateNamespace(language: PiLanguage, scopedef: PiScopeDef, relativePath: string): string {

        this.hasAdditionalNamespacetext = "";
        this.getAdditionalNamespacetext = "";
        this.additionalNamespaceImports = "";
        this.imports = [];

        if (!!scopedef) { // should always be the case, either the definition read from file or the default
            this.makeAdditionalNamespaceTexts(scopedef, language);
        }

        const allLangConcepts: string = Names.allConcepts(language);
        const langConceptType: string = Names.metaType(language);
        const generatedClassName: string = Names.namespace(language);
        const piNamedElementClassName: string = Names.PiNamedElement;
        const myIfStatement = this.createIfStatement(scopedef, language);

        // Template starts here
        return `
        import { ${piNamedElementClassName}, Language, CollectNamesWorker, LanguageWalker, PiElement } from "${PROJECTITCORE}";

        /**
         * Class ${generatedClassName} is a wrapper for a model element that is a namespace (as defined in the scoper definition).
         * It provides the implementation of the algorithm used to search for all names that are visible in the namespace.
         */
        export class ${generatedClassName} {
            private static allNamespaces: Map< PiElement, ${generatedClassName}> = new Map();
            
            /**
             * This method ensures that every element in the model has one and only one associated namespace object.
             * The type of element 'elem' should be marked as namespace in the scoper definition.
             * @param elem
             */
            public static create(elem: PiElement): ${generatedClassName} {
                if (this.allNamespaces.has(elem)) {
                    return this.allNamespaces.get(elem);
                } else {
                    const result = new ${generatedClassName}(elem);
                    this.allNamespaces.set(elem, result);
                    return result;
                }
            }
                               
            /**
             * This convenience method merges 'list' and 'result', where if an element is present in both,
             * the element in 'list' is discarded, thus shadowing names from 'list'.
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
    
            public _myElem: PiElement;
                        
            private constructor(elem: PiElement) {
                this._myElem = elem;
            }
            
            /**
             * Returns all elements that are visible in this namespace, including those from additional namespaces
             * as defined in the scoper definition.
             */
            public getVisibleElements(metatype?: string): ${piNamedElementClassName}[] {
                let result: ${piNamedElementClassName}[] = [];
        
                result = this.getInternalVisibleElements(metatype);
       
                return result;
            }
 
            /**
             * Returns the elements that are visible in this namespace only, without regard for additional namespaces
             * @param metatype
             */       
            private getInternalVisibleElements(metatype?: string): ${piNamedElementClassName}[] {
                const result: ${piNamedElementClassName}[] = [];       
                // for now we push all parts, later public/private annotations can be taken into account 
                ${myIfStatement}       
                return result;
            }
        }`;
    }

    private createIfStatement(scopedef: PiScopeDef, language: PiLanguage): string {
        let result: string = "";
        // let generatedConcepts: PiConcept[] = [];
        result += `// set up the 'worker' of the visitor pattern
                // const myNamesCollector = new ${Names.namesCollector(language)}();
                const myNamesCollector = new CollectNamesWorker();
                myNamesCollector.namesList = result;
                if (!!metatype) {
                    myNamesCollector.metatype = metatype;
                }
 
                // set up the 'walker of the visitor pattern
                // const myWalker = new ${Names.walker(language)}();
                const myWalker = new LanguageWalker();
                myWalker.myWorkers.push( myNamesCollector );
                
                // collect the elements from the namespace, but not from any child namespace
                myWalker.walk(this._myElem, (elem: PiElement)=> { 
                    return !Language.getInstance().classifier(elem.piLanguageConcept()).isNamespace; 
                } );`;
        // for (let piConcept of scopedef.namespaces) {
        //     let myClassifier = piConcept.referred;
        //     result += `// based on namespace '${myClassifier.name}'\n`;
        //     // TODO find out whether we can remove 'findAllImplementorsAndSubs' in new approach
        //     for (let xx of findAllImplementorsAndSubs(myClassifier)) {
        //         if (xx instanceof PiConcept) {
        //             if (!generatedConcepts.includes(xx)) {
        //                 // TODO useProperties of interface only is not taken into account in new approach
        //                 // result = result.concat(this.makeIfForConcept(xx, comment, myClassifier.allParts()));
        //                 result += `myWalker.walk(this._myElem, (elem: ${Names.allConcepts(language)})=> { return isNameSpace(elem); } );`;
        //                 generatedConcepts.push(xx);
        //                 this.imports.push(xx.name);
        //             }
        //         }
        //     }
        // }
        return result;
    }

    // private makeIfForConcept(piConcept: PiConcept, comment: string, useProperties: PiProperty[]): string {
    //     let result: string = comment;
    //     result = result.concat("if (this._myElem instanceof " + piConcept.name + ") {");
    //     for (let part of useProperties) {
    //         for (let allProperty of part.type.referred.allProperties()) {
    //             if (allProperty.name === "name") {
    //                 if (part.isList) {
    //                     result = result.concat(
    //                         "for (let z of this._myElem." + part.name + ") { this.addIfTypeOK(z, result, metatype);  }"
    //                     );
    //                 } else {
    //                     result = result.concat("this.addIfTypeOK(this._myElem." + part.name + ", result, metatype);");
    //                 }
    //             } else {
    //                 result = result.concat("");
    //             }
    //         }
    //     }
    //     result = result.concat("}" + "\n");
    //     return result;
    // }

    private makeAdditionalNamespaceTexts(scopedef: PiScopeDef, language: PiLanguage) {
        const generatedConcepts: PiConcept[] = [];
        for (const def of scopedef.scopeConceptDefs) {
            if (!!def.namespaceAdditions) {
                const myClassifier = def.conceptRef.referred;
                let isDone: boolean = false;
                const comment = "// based on namespace addition for " + myClassifier.name + "\n";
                if (myClassifier instanceof PiInterface) {
                    for (const implementor of LangUtil.findImplementorsRecursive(myClassifier)) {
                        if ( !generatedConcepts.includes(implementor)) {
                            isDone = true;
                        }
                        this.makeAdditionalNamespaceTextsForConcept(implementor, def, language, isDone, comment);
                        generatedConcepts.push(implementor);
                        this.imports.push(Names.concept(implementor));
                    }
                } else {
                    if ( !generatedConcepts.includes(myClassifier)) {
                        isDone = true;
                    }
                    this.makeAdditionalNamespaceTextsForConcept(myClassifier, def, language, isDone, comment);
                    generatedConcepts.push(myClassifier);
                    this.imports.push(Names.classifier(myClassifier));
                }
            }
        }
    }

    private makeAdditionalNamespaceTextsForConcept(piConcept: PiConcept, def: ScopeConceptDef, language: PiLanguage, isDone: boolean, comment: string) {
        const typeName = Names.concept(piConcept);
        // we are adding to three textstrings
        // first, to the import statements
        if (isDone) { // do this only if the concept has not yet been imported (indicated by isDone)
            this.additionalNamespaceImports = this.additionalNamespaceImports.concat(", " + typeName);
        }

        // second, to the 'hasAlternativeScope' method
        if (isDone) { // do this only if the concept has not yet been imported (indicated by isDone)
            this.hasAdditionalNamespacetext = this.hasAdditionalNamespacetext.concat(comment);
            this.hasAdditionalNamespacetext = this.hasAdditionalNamespacetext.concat(
                `if (this._myElem instanceof ${typeName}) {
                        return true;
                    }\n`);
        }

        // third, to the 'getAlternativeScope' method
        // Do this always, because the expression can be different for a concrete concept
        // and the interface that its implements. Both should added!
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(comment);
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(
            `if (this._myElem instanceof ${typeName}) {`);
        for (const expression of def.namespaceAdditions.expressions) {
            this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(this.addNamespaceExpression(expression, language));
        }
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(
            `}\n`);
    }

    private addNamespaceExpression(expression: PiLangExp, language: PiLanguage): string {
        let result: string = "";
        const generatedClassName: string = Names.namespace(language);
        const myRef = expression.findRefOfLastAppliedFeature();

        const loopVar: string = "loopVariable";
        let loopVarExtended = loopVar;
        if (myRef.isList) {
            if (myRef instanceof PiConceptProperty) {
                if (!myRef.isPart) {
                    loopVarExtended = loopVarExtended.concat(".referred");
                }
            }
            result = result.concat(`
            // generated based on '${expression.toPiString()}'
            for (let ${loopVar} of this._myElem.${expression.appliedfeature.toPiString()}) {
                if (!!${loopVarExtended}) {
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
