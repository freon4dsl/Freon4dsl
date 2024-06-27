import {
    FreMetaConcept,
    FreMetaInterface,
    FreLangExp,
    FreLangFunctionCallExp,
    FreMetaLanguage, FreMetaProperty
} from "../../../languagedef/metalanguage";
import {
    Names,
    LANGUAGE_GEN_FOLDER,
    FREON_CORE,
    GenerationUtil, LangUtil, ListUtil
} from "../../../utils";
import { ScopeDef, ScopeConceptDef } from "../../metalanguage";

export class ScoperTemplate {
    languageImports: string[] = []; // holds the names of all classifiers that need to be imported from the generated language structure
    hasAlternativeScopeText: string = "";
    getAlternativeScopeText: string = "";
    getAdditionalNamespacetext = "";

    generateGenIndex(language: FreMetaLanguage): string {
        return `
        export * from "./${Names.scoper(language)}";
        export * from "./${Names.scoperDef(language)}";
        `;
    }

    generateIndex(language: FreMetaLanguage): string {
        return `
        export * from "./${Names.customScoper(language)}";
        `;
    }

    generateScoper(language: FreMetaLanguage, scopedef: ScopeDef, relativePath: string): string {
        this.hasAlternativeScopeText = "";
        this.getAlternativeScopeText = "";

        // const langConceptType: string = Names.metaType(language);
        const generatedClassName: string = Names.scoper(language);
        const scoperBaseName: string = Names.FreScoperBase;

        const coreImports: string[] = [scoperBaseName, Names.FreLogger, Names.FreNode, Names.FreNamespace ];
        if (!!scopedef) { // should always be the case, either the definition read from file or the default
            this.makeAlternativeScopeTexts(scopedef);
            this.makeAdditionalNamespaceTexts(scopedef, coreImports);
        }
        // add the necessary names to the imports
        // ListUtil.addIfNotPresent(this.languageImports, langConceptType);
        // console.log("Adding 222: " + langConceptType + ", list: [" + this.languageImports.map(n => n).join(", ") + "]");

        // Template starts here - without imports, they are calculated while creating this text and added later
        const templateBody: string = `
        const LOGGER = new ${Names.FreLogger}("${generatedClassName}");

        /**
         * Class ${generatedClassName} implements the scoper generated from, if present, the scoper definition,
         * otherwise this class implements the default scoper.
         */
        export class ${generatedClassName} extends  ${scoperBaseName} {

             /**
             * Returns the namespace to be used as alternative scope for 'modelelement'.
             * @param modelelement
             */
            getAlternativeScope(modelelement: ${Names.FreNode}): ${Names.FreNamespace} {
                ${this.getAlternativeScopeText}
                return null;
            }

             /**
             * Returns true if there is an alternative scope defined for this 'modelelement'.
             * @param modelelement
             */
            hasAlternativeScope(modelelement: ${Names.FreNode}): boolean {
                ${this.hasAlternativeScopeText}
                return false;
            }

            /**
             * Returns all FreNodes that are defined as additional namespaces for \`element'.
             * @param element
             */
            public additionalNamespaces(element: ${Names.FreNode}): ${Names.FreNode}[] {
                const result: ${Names.FreNode}[] = [];
                ${this.getAdditionalNamespacetext}
                return result;

            }
        }`;

        // now we have enough information to create the correct imports
        const templateImports: string = `
        ${coreImports.length > 0 ? `import { ${coreImports.map(name => name).join(", ")} } from "${FREON_CORE}";`: "" }
        ${this.languageImports.length > 0 ? `import { ${this.languageImports.map(name => name).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";`: "" }
        `;

        return templateImports + templateBody;
    }

    private makeAdditionalNamespaceTexts(scopedef: ScopeDef, coreImports: string[]) {
        for (const def of scopedef.scopeConceptDefs) {
            if (!!def.namespaceAdditions) {
                const myClassifier: FreMetaConcept | undefined = def.conceptRef?.referred;
                if (!!myClassifier) {
                    const comment = "// based on namespace addition for " + myClassifier.name + "\n";
                    ListUtil.addIfNotPresent(this.languageImports, Names.classifier(myClassifier));
                    if (myClassifier instanceof FreMetaInterface) {
                        for (const implementor of LangUtil.findImplementorsRecursive(myClassifier)) {
                            this.makeAdditionalNamespaceTextsForConcept(implementor, def, comment, coreImports);
                            ListUtil.addIfNotPresent(this.languageImports, Names.concept(implementor));
                        }
                    } else {
                        this.makeAdditionalNamespaceTextsForConcept(myClassifier, def, comment, coreImports);
                        ListUtil.addIfNotPresent(this.languageImports, Names.classifier(myClassifier));
                    }
                }
            }
        }
    }

    private makeAdditionalNamespaceTextsForConcept(freConcept: FreMetaConcept, def: ScopeConceptDef, comment: string, coreImports: string[]) {
        const typeName = Names.concept(freConcept);
        // we are adding to three textstrings
        // first, to the import statements
        ListUtil.addIfNotPresent(this.languageImports, typeName);

        // second, to the 'getAlternativeScope' method
        // Do this always, because the expression can be different for a concrete concept
        // and the interface that its implements. Both should be added!
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(comment);
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(
            `if (element instanceof ${typeName}) {`);
        if (!!def.namespaceAdditions) {
            for (const expression of def.namespaceAdditions.expressions) {
                this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(this.addNamespaceExpression(expression, coreImports));
            }
        }
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(
            `}\n`);
    }

    private makeAlternativeScopeTexts(scopedef: ScopeDef) {
        for (const def of scopedef.scopeConceptDefs) {
            if (!!def.alternativeScope && !!def.conceptRef) {
                const conceptName: string = def.conceptRef.referred.name;
                // we are adding to three text strings
                // first, to the import statements
                ListUtil.addIfNotPresent(this.languageImports, Names.classifier(def.conceptRef.referred));
                // console.log("Adding 444: " + Names.classifier(def.conceptRef.referred)  + ", list: [" + this.languageImports.map(n => n).join(", ") + "]");

                // second, to the 'hasAlternativeScope' method
                this.hasAlternativeScopeText = this.hasAlternativeScopeText.concat(
                    `if (!!modelelement && modelelement instanceof ${conceptName}) {
                        return true;
                     }`);

                // third, to the 'getAlternativeScope' method
                if (!!def.alternativeScope.expression) {
                    this.getAlternativeScopeText = this.getAlternativeScopeText.concat(
                        `if (!!modelelement && modelelement instanceof ${conceptName}) {
                        // use alternative scope '${def.alternativeScope.expression.toFreString()}'
                        ${this.altScopeExpToTypeScript(def.alternativeScope.expression)}
                    }`);
                }
            }
        }
    }

    private addNamespaceExpression(expression: FreLangExp, coreImports: string[]): string {
        let result: string = "";
        const myRef: FreMetaProperty | undefined = expression.findRefOfLastAppliedFeature();

        const loopVar: string = "loopVariable";
        if (!!myRef && myRef.isList) {
            // add "FreNodeReference" to imports, because now we know that its is used
            ListUtil.addIfNotPresent(coreImports, Names.FreNodeReference);
            result = result.concat(`
            // generated based on '${expression.toFreString()}'
            for (let ${loopVar} of element.${expression.appliedfeature.toFreString()}) {
                if (loopVariable instanceof ${Names.FreNodeReference}) {
                    if (!this.currentRoleNames.includes('${expression.appliedfeature.toFreString()}')) {
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
            // TODO check use of toFreString()
            const namespaceExpression = `element.${expression.appliedfeature.toFreString()}`;
            result = result.concat(`
               // generated based on '${expression.toFreString()}'
               if (!this.currentRoleNames.includes('${expression.appliedfeature.toFreString()}')) {
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

    private altScopeExpToTypeScript(expression: FreLangExp): string {
        let result;
        // special case: the expression refers to 'typeof'
        if (expression instanceof FreLangFunctionCallExp && expression.sourceName === "typeof") {
            let actualParamToGenerate: string = '';
            // we know that typeof has exactly 1 actual parameter
            if ( expression.actualparams[0].sourceName === "container" ) {
                actualParamToGenerate = `modelelement.freOwnerDescriptor().owner`;
            } else {
                actualParamToGenerate = GenerationUtil.langExpToTypeScript(expression.actualparams[0]);
            }
            result = `let owner = ${actualParamToGenerate};
                if (!!owner) {
                    let newScopeElement = this.myTyper.inferType(owner)?.toAstElement();
                    // 'newScopeElement' could be null, when the type found by the typer does not correspond to an AST element
                    if (!!newScopeElement) {
                        return ${Names.FreNamespace}.create(newScopeElement);
                    }
                }`;
        } else {
            // normal case: the expression is an ordinary expression over the language
            result = GenerationUtil.langExpToTypeScript(expression);
        }
        return result;
    }
}
