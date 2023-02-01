import {
    PiConcept, PiConceptProperty,
    PiInterface,
    PiLangExp,
    PiLangFunctionCallExp,
    PiLanguage
} from "../../../languagedef/metalanguage";
import {
    Names,
    LANGUAGE_GEN_FOLDER,
    PROJECTITCORE,
    TYPER_GEN_FOLDER,
    CONFIGURATION_GEN_FOLDER,
    GenerationUtil, LangUtil, ListUtil
} from "../../../utils";
import { PiScopeDef, ScopeConceptDef } from "../../metalanguage";

export class ScoperTemplate {
    languageImports: string[] = []; // holds the names of all classifiers that need to be imported from the generated language structure
    hasAlternativeScopeText: string = "";
    getAlternativeScopeText: string = "";
    getAdditionalNamespacetext = "";

    generateGenIndex(language: PiLanguage): string {
        return `
        export * from "./${Names.scoper(language)}";
        export * from "./${Names.scoperDef(language)}";
        `;
    }

    generateIndex(language: PiLanguage): string {
        return `
        export * from "./${Names.customScoper(language)}";
        `;
    }

    generateScoper(language: PiLanguage, scopedef: PiScopeDef, relativePath: string): string {
        this.hasAlternativeScopeText = "";
        this.getAlternativeScopeText = "";

        const langConceptType: string = Names.metaType(language);
        const generatedClassName: string = Names.scoper(language);
        const scoperBaseName: string = Names.FreScoperBase;
        const scoperInterfaceName: string = Names.FrScoperPart;
        const typerClassName: string = Names.typer(language);

        let generateAlternativeScopes = false;
        if (!!scopedef) { // should always be the case, either the definition read from file or the default
            this.makeAlternativeScopeTexts(scopedef, language);
            this.makeAdditionalNamespaceTexts(scopedef, language);
            if (this.hasAlternativeScopeText.length > 0) {
                generateAlternativeScopes = true;
            }
        }
        // add the necessary names to the imports
        ListUtil.addIfNotPresent(this.languageImports, langConceptType);
        // console.log("Adding 222: " + langConceptType + ", list: [" + this.languageImports.map(n => n).join(", ") + "]");

        // Template starts here - without imports, they are calculated while creating this text and added later
        const templateBody: string = `
        const LOGGER = new PiLogger("${generatedClassName}");  
        
        /**
         * Class ${generatedClassName} implements the scoper generated from, if present, the scoper definition,
         * otherwise this class implements the default scoper. 
         */      
        export class ${generatedClassName} extends  ${scoperBaseName} {

             /**
             * Returns the namespace to be used as alternative scope for 'modelelement'.
             * @param modelelement
             */
            getAlternativeScope(modelelement: PiElement): FreonNamespace {
                ${this.getAlternativeScopeText}
                return null;
            }
        
             /**
             * Returns true if there is an alternative scope defined for this 'modelelement'.
             * @param modelelement
             */
            hasAlternativeScope(modelelement: PiElement): boolean {
                ${this.hasAlternativeScopeText}
                return false;
            }
            
            /**
             * Returns all PiElements that are defined as additional namespaces for \`element'.
             * @param element
             */
            public additionalNamespaces(element: PiElement): PiElement[] {
                const result: PiElement[] = [];
                ${this.getAdditionalNamespacetext}
                return result;

            }
        }`;

        // now we have enough information to create the correct imports
        const templateImports: string = `
        import { ${scoperBaseName}, PiLogger, PiElement, PiElementReference, FreonNamespace, ${Names.FreonTyper} } from "${PROJECTITCORE}"
        import { ${this.languageImports.map(name => name).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
        `;

        return templateImports + templateBody;
    }

    private makeAdditionalNamespaceTexts(scopedef: PiScopeDef, language: PiLanguage) {
        const generatedConcepts: PiConcept[] = [];
        for (const def of scopedef.scopeConceptDefs) {
            if (!!def.namespaceAdditions) {
                const myClassifier = def.conceptRef.referred;
                // let isDone: boolean = false;
                const comment = "// based on namespace addition for " + myClassifier.name + "\n";
                ListUtil.addIfNotPresent(this.languageImports, myClassifier.name); // TODO
                if (myClassifier instanceof PiInterface) {
                    for (const implementor of LangUtil.findImplementorsRecursive(myClassifier)) {
                        // if ( !generatedConcepts.includes(implementor)) {
                        //     isDone = true;
                        // }
                        this.makeAdditionalNamespaceTextsForConcept(implementor, def, language, comment);
                        generatedConcepts.push(implementor);
                        ListUtil.addIfNotPresent(this.languageImports, Names.concept(implementor));
                        // console.log("Adding 666: " + Names.classifier(implementor) + ", list: [" + this.languageImports.map(n => n).join(", ") + "]");
                    }
                } else {
                    // if ( !generatedConcepts.includes(myClassifier)) {
                    //     isDone = true;
                    // }
                    this.makeAdditionalNamespaceTextsForConcept(myClassifier, def, language, comment);
                    generatedConcepts.push(myClassifier);
                    ListUtil.addIfNotPresent(this.languageImports, Names.classifier(myClassifier));
                    // console.log("Adding 555: " + Names.classifier(myClassifier) + ", list: [" + this.languageImports.map(n => n).join(", ") + "]");
                }
            }
        }
    }

    private makeAdditionalNamespaceTextsForConcept(piConcept: PiConcept, def: ScopeConceptDef, language: PiLanguage, comment: string) {
        const typeName = Names.concept(piConcept);
        // we are adding to three textstrings
        // first, to the import statements
        ListUtil.addIfNotPresent(this.languageImports, typeName);
        // console.log("Adding 333: " + typeName + ", list: [" + this.languageImports.map(n => n).join(", ") + "]");

        // second, to the 'getAlternativeScope' method
        // Do this always, because the expression can be different for a concrete concept
        // and the interface that its implements. Both should added!
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(comment);
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(
            `if (element instanceof ${typeName}) {`);
        for (const expression of def.namespaceAdditions.expressions) {
            this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(this.addNamespaceExpression(expression, language));
        }
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(
            `}\n`);
    }

    private makeAlternativeScopeTexts(scopedef: PiScopeDef, language: PiLanguage) {
        const allLangConcepts: string = Names.allConcepts(language);
        for (const def of scopedef.scopeConceptDefs) {
            if (!!def.alternativeScope) {
                const conceptName = def.conceptRef.referred.name;
                // we are adding to three textstrings
                // first, to the import statements
                ListUtil.addIfNotPresent(this.languageImports, Names.classifier(def.conceptRef.referred));
                // console.log("Adding 444: " + Names.classifier(def.conceptRef.referred)  + ", list: [" + this.languageImports.map(n => n).join(", ") + "]");

                // second, to the 'hasAlternativeScope' method
                this.hasAlternativeScopeText = this.hasAlternativeScopeText.concat(
                    `if (!!modelelement && modelelement instanceof ${conceptName}) {
                        return true;
                     }`);

                // third, to the 'getAlternativeScope' method
                this.getAlternativeScopeText = this.getAlternativeScopeText.concat(
                    `if (!!modelelement && modelelement instanceof ${conceptName}) {
                        // use alternative scope '${def.alternativeScope.expression.toPiString()}'
                        ${this.altScopeExpToTypeScript(def.alternativeScope.expression, allLangConcepts)}
                    }`);
            }
        }
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
            const namespaceExpression = `element.${expression.appliedfeature.toPiString()}`;
            result = result.concat(`
            // generated based on '${expression.toPiString()}'
            for (let ${loopVar} of element.${expression.appliedfeature.toPiString()}) {
                if (loopVariable instanceof PiElementReference) {
                    if (!this.currentRoleNames.includes('${expression.appliedfeature.toPiString()}')) {
                        if (!!loopVariable.referred) {
                            if (!this.additionalNamespacesVisited.includes(loopVariable)){
                                this.additionalNamespacesVisited.push(loopVariable);
                                const referred = loopVariable.referred;
                                if(!!referred) { 
                                    result.push(loopVariable.referred);
                                }
                                this.additionalNamespacesVisited.pop();
                            }
                        }
                    }
                } else {
                    result.push(loopVariable);
                }
            }`);
        } else {
            // TODO check use of toPiString()
            const namespaceExpression = `element.${expression.appliedfeature.toPiString()}`;
            result = result.concat(`
               // generated based on '${expression.toPiString()}' 
               if (!this.currentRoleNames.includes('${expression.appliedfeature.toPiString()}')) {
                   if (!!${namespaceExpression}) {
                      if (!this.additionalNamespacesVisited.includes(${namespaceExpression})){
                         this.additionalNamespacesVisited.push(${namespaceExpression});
                         const referred = ${namespaceExpression}.referred;
                         if(!!referred) { 
                            result.push(${namespaceExpression}.referred);
                         }
                         this.additionalNamespacesVisited.pop();
                      }
                   }
               }`);
        }
        return result;
    }

    private altScopeExpToTypeScript(expression: PiLangExp, allLangConcepts: string): string {
        let result;
        // special case: the expression refers to 'typeof'
        if (expression instanceof PiLangFunctionCallExp && expression.sourceName === "typeof") {
            let actualParamToGenerate: string;
            // we know that typeof has exactly 1 actual parameter
            if ( expression.actualparams[0].sourceName === "container" ) {
                actualParamToGenerate = `modelelement.piOwnerDescriptor().owner`;
            } else {
                actualParamToGenerate = GenerationUtil.langExpToTypeScript(expression.actualparams[0]);
            }
            result = `let owner = ${actualParamToGenerate};
                if (!!owner) {
                    let newScopeElement = this.myTyper.inferType(owner)?.toAstElement();
                    // 'newScopeElement' could be null, when the type found by the typer does not correspond to an AST element
                    if (!!newScopeElement) {
                        return FreonNamespace.create(newScopeElement);
                    }
                }`;
        } else {
            // normal case: the expression is an ordinary expression over the language
            result = GenerationUtil.langExpToTypeScript(expression);
        }
        return result;
    }
}
