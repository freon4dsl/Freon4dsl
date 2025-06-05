import {
    FreMetaInterface,
    FreLangFunctionCallExp,
    FreMetaLanguage,
    FreMetaProperty, FreMetaClassifier
} from '../../../languagedef/metalanguage/index.js';
import { Names, GenerationUtil, LangUtil, Imports } from "../../../utils/index.js"
import { ScopeDef, ScopeConceptDef, FreNamespaceExpression } from '../../metalanguage/index.js';

export class ScoperTemplate {
    additionalNamespaceText: string = "";
    replacementNamespaceText = "";

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
        this.replacementNamespaceText = "";
        this.additionalNamespaceText = "";

        const imports = new Imports(relativePath);
        imports.core = new Set<string>([
            Names.FreScoperBase, Names.FreNode, Names.FreNamedNode, Names.FreNamespaceInfo, Names.FreNodeReference
        ]);
        if (!!scopedef) {
            // should always be the case, either the definition read from file or the default
            this.makeReplacementNamespaceTexts(scopedef, imports);
            this.makeAdditionalNamespaceTexts(scopedef, imports);
        }

        // Template starts here
        return `
        ${imports.makeImports(language)}
        
        /**
         * Class ${Names.scoper(language)} implements the scoper generated from, if present, the scoper definition,
         * otherwise this class implements the default scoper.
         */
        export class ${Names.scoper(language)} extends ${Names.FreScoperBase} {

             /**
             * Returns all FreNodes or FreNodeReferences that are defined as replacement namespaces for 'node'.
             * @param node
             */${this.replacementNamespaceText.length === 0 ? `\n// @ts-ignore` : ``}
            public alternativeNamespaces(node: ${Names.FreNode}): ${Names.FreNamespaceInfo}[] {
                ${this.replacementNamespaceText.length > 0 ? 
                    `const result: ${Names.FreNamespaceInfo}[] = [];
                    ${this.replacementNamespaceText}
                    return result;`
                : `return [];`}
            }

            /**
             * Returns all FreNodes or FreNodeReferences that are defined as additional namespaces for 'node'.
             * @param node
             */${this.additionalNamespaceText.length === 0 ? `\n// @ts-ignore` : ``}
            public importedNamespaces(node: ${Names.FreNode}): ${Names.FreNamespaceInfo}[] {
                ${this.additionalNamespaceText.length > 0 ?
                    `const result: ${Names.FreNamespaceInfo}[] = [];
                    ${this.additionalNamespaceText}
                    return result;`
                : `return [];`}
            }
        }`;
    }

    private makeAdditionalNamespaceTexts(scopedef: ScopeDef, imports: Imports) {
        // console.log('makeAdditionalNamespaceTexts')
        for (const def of scopedef.scopeConceptDefs) {
            // console.log('\t found scopeConceptDefs')
            if (!!def.namespaceAddition) {
                // console.log('\tfound additions')
                const myClassifier: FreMetaClassifier | undefined = def.classifierRef?.referred;
                if (!!myClassifier) {
                    const comment = "// namespace addition for " + myClassifier.name + "\n";
                    // console.log('\t' + comment)
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
        // we are adding to two elements to the template
        // first, to the import statements
        imports.language.add(typeName);

        // second, to the 'namespaceReplacement' method
        // Do this always, because the expression can be different for a concrete concept
        // and the interface that its implements. Both should be added!
        this.additionalNamespaceText += comment + `if (node instanceof ${typeName}) {`;
        if (!!def.namespaceAddition) {
            for (const expression of def.namespaceAddition.expressions) {
                this.additionalNamespaceText = this.additionalNamespaceText.concat(
                    this.addNamespaceExpression(expression),
                );
            }
        }
        this.additionalNamespaceText = this.additionalNamespaceText.concat(`}\n`);
    }

    private makeReplacementNamespaceTexts(scopedef: ScopeDef, imports: Imports) {
        for (const def of scopedef.scopeConceptDefs) {
            if (!!def.namespaceReplacement) {
                // console.log('\tfound replacements')
                const myClassifier: FreMetaClassifier | undefined = def.classifierRef?.referred;
                if (!!myClassifier) {
                    const comment = "// namespace replacement for " + myClassifier.name + "\n";
                    // console.log('\t' + comment)
                    imports.language.add(Names.classifier(myClassifier));
                    if (myClassifier instanceof FreMetaInterface) {
                        for (const implementor of LangUtil.findImplementorsRecursive(myClassifier)) {
                            this.makeReplacementNamespaceTextsForClassifier(implementor, def, comment, imports);
                            imports.language.add(Names.classifier(implementor));
                        }
                    } else {
                        this.makeReplacementNamespaceTextsForClassifier(myClassifier, def, comment, imports);
                        imports.language.add(Names.classifier(myClassifier));
                    }
                }
            }
        }
    }

    private makeReplacementNamespaceTextsForClassifier(
      freConcept: FreMetaClassifier,
      def: ScopeConceptDef,
      comment: string,
      imports: Imports,
    ) {
        const typeName = Names.classifier(freConcept);
        // we are adding to two elements to the template
        // first, to the import statements
        imports.language.add(typeName);

        // second, to the 'namespaceReplacement' method
        // Do this always, because the expression can be different for a concrete concept
        // and the interface that its implements. Both should be added!
        this.replacementNamespaceText += comment + `if (node instanceof ${typeName}) {`;
        if (!!def.namespaceReplacement) {
            for (const expression of def.namespaceReplacement.expressions) {
                this.replacementNamespaceText = this.replacementNamespaceText.concat(
                  this.replacementNamespaceExpToTypeScript(expression)
                );
            }
        }
        this.replacementNamespaceText = this.replacementNamespaceText.concat(`}\n`);
    }

    private addNamespaceExpression(expression: FreNamespaceExpression): string {
        let result: string = "";
        if (expression.expression) {
            const myRef: FreMetaProperty | undefined = expression.expression.findRefOfLastAppliedFeature();
            const namespaceExpression = `node.${GenerationUtil.langExpToTypeScript(expression.expression.applied, 'node', true)}`;
            if (!!myRef) {
                if (myRef.isList) {
                    const loopVar: string = "loopVariable";
                    result = result.concat(`
                // generated based on '${expression.toFreString()}'
                for (let ${loopVar} of ${namespaceExpression}) {
                    result.push(new ${Names.FreNamespaceInfo}(${loopVar}, ${expression.recursive}));
                }`);
                } else {
                    result = result.concat(`
                // generated based on '${expression.toFreString()}'
                result.push(new ${Names.FreNamespaceInfo}(${namespaceExpression}, ${expression.recursive}));
                `);
                }
            }
        }
        return result;
    }

    // @ts-ignore
    private replacementNamespaceExpToTypeScript(expression: FreNamespaceExpression): string {
        let resultStr: string;
        if (expression.expression instanceof FreLangFunctionCallExp && expression.expression.name === "typeof") {
            // special case: the expression refers to 'typeof'
            let actualParamToGenerate: string;
            // we know that typeof has exactly 1 actual parameter
            if (expression.expression.actualparams[0].name === "container") {
                actualParamToGenerate = `node.freOwnerDescriptor()?.owner`;
            } else {
                actualParamToGenerate = GenerationUtil.langExpToTypeScript(expression.expression.actualparams[0], "node");
            }
            resultStr = `let owner = ${actualParamToGenerate};
                if (!!owner) {
                    let newScopeElement = this.myTyper.inferType(owner)?.toAstElement();
                    // 'newScopeElement' could be null, when the type found by the typer does not correspond to an AST node
                    if (!!newScopeElement) {
                        result.push(new ${Names.FreNamespaceInfo}(newScopeElement as ${Names.FreNamedNode}, ${expression.recursive}));
                    }
                } else {
                    console.log("Alternative Namespace for node " + node.freId() + " ")
                }`;
        } else if (!!expression.expression && expression.expression.name === "container") {
            // special case: the expression refers to 'container'
            resultStr = `let container = node.freOwner();
            if (!!container) {
                result.push(new ${Names.FreNamespaceInfo}(container as ${Names.FreNamedNode}, ${expression.recursive}));
            } else {
                console.error("getReplacementNamespace: no container found.");
            }`;
        } else {
            // normal case: the expression is an ordinary expression over the language
            resultStr = `result.push(new ${Names.FreNamespaceInfo}(${GenerationUtil.langExpToTypeScript(expression.expression!, "node")}, ${expression.recursive}))`;
        }
        return resultStr;
    }
}
