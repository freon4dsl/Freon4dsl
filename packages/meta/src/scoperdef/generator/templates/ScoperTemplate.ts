import {
    FreMetaInterface,
    FreLangExp,
    FreLangFunctionCallExp,
    FreMetaLanguage,
    FreMetaProperty, FreMetaClassifier
} from '../../../languagedef/metalanguage/index.js';
import { Names, GenerationUtil, LangUtil, Imports } from "../../../utils/index.js"
import { ScopeDef, ScopeConceptDef } from "../../metalanguage/index.js";

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
            Names.FreScoperBase, Names.FreNode, Names.FreNamedNode, Names.FreNodeReference
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
            public replacementNamespaces(node: ${Names.FreNode}): (${Names.FreNamedNode} | ${Names.FreNodeReference}<${Names.FreNamedNode}>)[] {
                ${this.replacementNamespaceText.length > 0 ? 
                    `const result: (${Names.FreNamedNode} | ${Names.FreNodeReference}<${Names.FreNamedNode}>)[] = [];
                    ${this.replacementNamespaceText}
                    return result;`
                : `return [];`}
            }

            /**
             * Returns all FreNodes or FreNodeReferences that are defined as additional namespaces for 'node'.
             * @param node
             */${this.additionalNamespaceText.length === 0 ? `\n// @ts-ignore` : ``}
            public additionalNamespaces(node: ${Names.FreNode}): (${Names.FreNamedNode} | ${Names.FreNodeReference}<${Names.FreNamedNode}>)[] {
                ${this.additionalNamespaceText.length > 0 ?
                    `const result: (${Names.FreNamedNode} | ${Names.FreNodeReference}<${Names.FreNamedNode}>)[] = [];
                    ${this.additionalNamespaceText}
                    return result;`
                : `return [];`}
            }
        }`;
    }

    private makeAdditionalNamespaceTexts(scopedef: ScopeDef, imports: Imports) {
        for (const def of scopedef.scopeConceptDefs) {
            if (!!def.namespaceAdditions) {
                const myClassifier: FreMetaClassifier | undefined = def.conceptRef?.referred;
                if (!!myClassifier) {
                    const comment = "// namespace addition for " + myClassifier.name + "\n";
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

        // second, to the 'replacementNamespace' method
        // Do this always, because the expression can be different for a concrete concept
        // and the interface that its implements. Both should be added!
        this.additionalNamespaceText += comment + `if (node instanceof ${typeName}) {`;
        if (!!def.namespaceAdditions) {
            for (const expression of def.namespaceAdditions.expressions) {
                this.additionalNamespaceText = this.additionalNamespaceText.concat(
                    this.addNamespaceExpression(expression),
                );
            }
        }
        this.additionalNamespaceText = this.additionalNamespaceText.concat(`}\n`);
    }

    private makeReplacementNamespaceTexts(scopedef: ScopeDef, imports: Imports) {
        for (const def of scopedef.scopeConceptDefs) {
            if (!!def.replacementNamespace && !!def.conceptRef) {
                const conceptName: string = def.conceptRef.referred.name;
                // we are adding to three text strings
                // first, to the import statements
                imports.language.add(Names.classifier(def.conceptRef.referred));

                // second, to the 'replacementNamespace' method
                if (!!def.replacementNamespace.expression) {
                    this.replacementNamespaceText = this.replacementNamespaceText.concat(
                        `if (!!node && node instanceof ${conceptName}) {
                        // use replacement namespace '${def.replacementNamespace.expression.toFreString()}'
                        ${this.replacementNamespaceExpToTypeScript(def.replacementNamespace.expression)}
                    }`,
                    );
                }
            }
        }
    }

    private addNamespaceExpression(expression: FreLangExp): string {
        let result: string = "";
        const myRef: FreMetaProperty | undefined = expression.findRefOfLastAppliedFeature();
        const namespaceExpression = `node.${GenerationUtil.langExpToTypeScript(expression.appliedfeature, 'node', true)}`;
        if (!!myRef) {
            if (myRef.isList) {
                const loopVar: string = "loopVariable";
                result = result.concat(`
                // generated based on '${expression.toFreString()}'
                for (let ${loopVar} of ${namespaceExpression}) {
                    result.push(${loopVar});
                }`);
            } else {
                result = result.concat(`
                // generated based on '${expression.toFreString()}'
                result.push(${namespaceExpression});
                `);
            }
        }
        return result;
    }

    private replacementNamespaceExpToTypeScript(expression: FreLangExp): string {
        let resultStr: string;
        if (expression instanceof FreLangFunctionCallExp && expression.sourceName === "typeof") {
            // special case: the expression refers to 'typeof'
            let actualParamToGenerate: string;
            // we know that typeof has exactly 1 actual parameter
            if (expression.actualparams[0].sourceName === "container") {
                actualParamToGenerate = `node.freOwnerDescriptor()?.owner`;
            } else {
                actualParamToGenerate = GenerationUtil.langExpToTypeScript(expression.actualparams[0], "node");
            }
            resultStr = `let owner = ${actualParamToGenerate};
                if (!!owner) {
                    let newScopeElement = this.myTyper.inferType(owner)?.toAstElement();
                    // 'newScopeElement' could be null, when the type found by the typer does not correspond to an AST node
                    if (!!newScopeElement) {
                        result.push(newScopeElement as ${Names.FreNamedNode});
                    }
                } else {
                    console.log("Replacement Namespace for node " + node.freId() + " ")
                }`;
        } else if (expression.sourceName === "container" && (expression.appliedfeature === null || expression.appliedfeature === undefined)) {
            // special case: the expression refers to 'container'
            resultStr = `let container = node.freOwner();
            if (!!container) {
                result.push(container as ${Names.FreNamedNode});
            } else {
                console.error("getReplacementNamespace: no container found.");
            }`;
        } else {
            // normal case: the expression is an ordinary expression over the language
            resultStr = `result.push(${GenerationUtil.langExpToTypeScript(expression, "node")})`;
        }
        return resultStr;
    }
}
