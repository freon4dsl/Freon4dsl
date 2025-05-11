import {
    FreMetaConcept,
    FreMetaInterface,
    FreLangExp,
    FreLangFunctionCallExp,
    FreMetaLanguage,
    FreMetaProperty, FreMetaClassifier
} from '../../../languagedef/metalanguage/index.js';
import { Names, GenerationUtil, LangUtil, Imports } from "../../../utils/index.js"
import { ScopeDef, ScopeConceptDef } from "../../metalanguage/index.js";

export class ScoperTemplate {
    hasAlternativeScopeText: string = "";
    getAlternativeScopeText: string = "";
    getAdditionalNamespacetext = "";

    generateGenIndex(language: FreMetaLanguage): string {
        return `
        export * from "./${Names.scoper(language)}.js";
        export * from "./${Names.scoperDef(language)}.js";
        `;
    }

    generateIndex(language: FreMetaLanguage): string {
        return `
        export * from "./${Names.customScoper(language)}.js";
        `;
    }

    generateScoper(language: FreMetaLanguage, scopedef: ScopeDef, relativePath: string): string {
        this.hasAlternativeScopeText = "";
        this.getAlternativeScopeText = "";

        // const langConceptType: string = Names.metaType(language);
        const generatedClassName: string = Names.scoper(language);

        const imports = new Imports(relativePath)
        imports.core = new Set<string>([
            Names.FreScoperBase, Names.FreLogger, Names.FreNode, Names.FreNamespace
        ])
        if (!!scopedef) {
            // should always be the case, either the definition read from file or the default
            this.makeAlternativeScopeTexts(scopedef, imports);
            this.makeAdditionalNamespaceTexts(scopedef, imports);
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
        export class ${generatedClassName} extends  ${Names.FreScoperBase} {

             /**
             * Returns the namespace to be used as alternative scope for 'node'.
             * @param node
             */
            getAlternativeScope(node: ${Names.FreNode}): ${Names.FreNamespace} {
                ${this.getAlternativeScopeText}
                return null;
            }

             /**
             * Returns true if there is an alternative scope defined for this 'node'.
             * @param node
             */
            hasAlternativeScope(node: ${Names.FreNode}): boolean {
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
        return `
            ${imports.makeImports(language)}
            
            ${templateBody}
        `;
    }

    private makeAdditionalNamespaceTexts(scopedef: ScopeDef, imports: Imports) {
        for (const def of scopedef.scopeConceptDefs) {
            if (!!def.namespaceAdditions) {
                const myClassifier: FreMetaConcept | undefined = def.conceptRef?.referred;
                if (!!myClassifier) {
                    const comment = "// based on namespace addition for " + myClassifier.name + "\n";
                    imports.language.add(Names.classifier(myClassifier));
                    if (myClassifier instanceof FreMetaInterface) {
                        for (const implementor of LangUtil.findImplementorsRecursive(myClassifier)) {
                            this.makeAdditionalNamespaceTextsForClassifier(implementor, def, comment, imports);
                            imports.language.add(Names.classifier(implementor));
                        }
                    } else {
                        this.makeAdditionalNamespaceTextsForClassifier(myClassifier, def, comment, imports);
                        imports.language.add(Names.classifier(myClassifier));
                    }
                }
            }
        }
    }

    private makeAdditionalNamespaceTextsForClassifier(
        freConcept: FreMetaClassifier,
        def: ScopeConceptDef,
        comment: string,
        imports: Imports,
    ) {
        const typeName = Names.classifier(freConcept);
        // we are adding to three textstrings
        // first, to the import statements
        imports.language.add(typeName);

        // second, to the 'getAlternativeScope' method
        // Do this always, because the expression can be different for a concrete concept
        // and the interface that its implements. Both should be added!
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(comment);
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(
            `if (element instanceof ${typeName}) {`,
        );
        if (!!def.namespaceAdditions) {
            for (const expression of def.namespaceAdditions.expressions) {
                this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(
                    this.addNamespaceExpression(expression, imports),
                );
            }
        }
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(`}\n`);
    }

    private makeAlternativeScopeTexts(scopedef: ScopeDef, imports: Imports) {
        for (const def of scopedef.scopeConceptDefs) {
            if (!!def.alternativeScope && !!def.conceptRef) {
                const conceptName: string = def.conceptRef.referred.name;
                // we are adding to three text strings
                // first, to the import statements
                imports.language.add(Names.classifier(def.conceptRef.referred));
                // console.log("Adding 444: " + Names.classifier(def.conceptRef.referred)  + ", list: [" + this.languageImports.map(n => n).join(", ") + "]");

                // second, to the 'hasAlternativeScope' method
                this.hasAlternativeScopeText = this.hasAlternativeScopeText.concat(
                    `if (!!node && node instanceof ${conceptName}) {
                        return true;
                     }`,
                );

                // third, to the 'getAlternativeScope' method
                if (!!def.alternativeScope.expression) {
                    this.getAlternativeScopeText = this.getAlternativeScopeText.concat(
                        `if (!!node && node instanceof ${conceptName}) {
                        // use alternative scope '${def.alternativeScope.expression.toFreString()}'
                        ${this.altScopeExpToTypeScript(def.alternativeScope.expression)}
                    }`,
                    );
                }
            }
        }
    }

    private addNamespaceExpression(expression: FreLangExp, imports: Imports): string {
        let result: string = "";
        const myRef: FreMetaProperty | undefined = expression.findRefOfLastAppliedFeature();

        const loopVar: string = "loopVariable";
        if (!!myRef && myRef.isList) {
            // add "FreNodeReference" to imports, because now we know that its is used
            imports.core.add(Names.FreNodeReference);
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
        if (expression instanceof FreLangFunctionCallExp && expression.sourceName === "typeof") {
            // special case: the expression refers to 'typeof'
            let actualParamToGenerate: string = "";
            // we know that typeof has exactly 1 actual parameter
            if (expression.actualparams[0].sourceName === "container") {
                actualParamToGenerate = `node.freOwnerDescriptor()?.owner`;
            } else {
                actualParamToGenerate = GenerationUtil.langExpToTypeScript(expression.actualparams[0], "node");
            }
            result = `let owner = ${actualParamToGenerate};
                if (!!owner) {
                    let newScopeElement = this.myTyper.inferType(owner)?.toAstElement();
                    // 'newScopeElement' could be null, when the type found by the typer does not correspond to an AST element
                    if (!!newScopeElement) {
                        return ${Names.FreNamespace}.create(newScopeElement);
                    }
                } else {
                    console.log("AlternativeScoper for node " + node.freId() + " ")
                }`;
        } else if (expression.sourceName === "container") {
            // special case: the expression refers to 'container'
            result = `// Note that this code is here to avoid a compile error.
            // The result is the same as the default behaviour of the scoper.
            let container = node.freOwner();
            if (!!container) {
                return FreNamespace.create(container);
            } else {
                console.error("getAlternativeScope: no container found.");
            }`;
        } else {
            // normal case: the expression is an ordinary expression over the language
            result = GenerationUtil.langExpToTypeScript(expression, "node");
        }
        return result;
    }
}
