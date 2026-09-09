import type {
    FreMetaLanguage,
    FreMetaClassifier
} from '../../../languagedef/metalanguage/index.js';
import { Names, Imports } from '../../../utils/on-lang/index.js';
import type { ScopeDef, FreMetaNamespaceInfo } from '../../metalanguage/index.js';
import { ExpressionGenerationUtil } from '../../../langexpressions/generator/ExpressionGenerationUtil.js';
import { isNullOrUndefined } from '../../../utils/file-utils/index.js';

export class ScoperTemplate {
    importedNamespaceText: string = "";
    alternativeNamespaceText: string = "";

    generateGenIndex(language: FreMetaLanguage): string {
        return `
        export * from "./${Names.scoper(language)}.js";
        export * from "./${Names.scoperDef(language)}.js";
        `;
    }

    generateScoper(language: FreMetaLanguage, scopedef: ScopeDef, relativePath: string): string {
        this.alternativeNamespaceText = "";
        this.importedNamespaceText = "";

        const imports = new Imports(relativePath);
        imports.core = new Set<string>([Names.FreNode]);
        imports.scoper = new Set<string>([Names.FreScoperBase, Names.FreNamespaceInfo])
        if (!!scopedef) {
            // should always be the case, either the definition read from file or the default
            this.makeAlternativeNamespaceTexts(scopedef, imports);
            this.makeImportedNamespaceTexts(scopedef, imports);
        }

        // Template starts here
        return `
        ${imports.makeImports(language)}
        
        /**
         * Class ${Names.scoper(language)} implements the scoper generated from, if present, the scoper definition,
         * otherwise this class implements the default scoper.
         */
        export class ${Names.scoper(language)} extends ${Names.FreScoperBase}<${Names.FreNode}> {

             /**
             * Returns all FreNodes or FreNodeReferences that are defined as alternative namespaces for 'node'.
             * @param node
             */${this.alternativeNamespaceText.length === 0 ? `\n// @ts-ignore` : ``}
            public alternativeNamespaces(node: ${Names.FreNode}): ${Names.FreNamespaceInfo}<${Names.FreNode}>[] {
                ${
                    this.alternativeNamespaceText.length > 0
                        ? `const result: ${Names.FreNamespaceInfo}<${Names.FreNode}>[] = [];
                    ${this.alternativeNamespaceText}
                    return result;`
                        : `return [];`
                }
            }

            /**
             * Returns all FreNodes or FreNodeReferences that are defined as imported namespaces for 'node'.
             * @param node
             */${this.importedNamespaceText.length === 0 ? `\n// @ts-ignore` : ``}
            public importedNamespaces(node: ${Names.FreNode}): ${Names.FreNamespaceInfo}<${Names.FreNode}>[] {
                ${
                    this.importedNamespaceText.length > 0
                        ? `const result: ${Names.FreNamespaceInfo}<${Names.FreNode}>[] = [];
                    ${this.importedNamespaceText}
                    return result;`
                        : `return [];`
                }
            }
        }`
    }

    private makeImportedNamespaceTexts(scopedef: ScopeDef, imports: Imports) {
        // console.log('makeAdditionalNamespaceTexts')
        for (const def of scopedef.scopeConceptDefs) {
            // console.log('\t found scopeConceptDefs')
            if (!!def.namespaceImports) {
                // console.log('\tfound additions')
                const myClassifier: FreMetaClassifier | undefined = def.classifier;
                if (!!myClassifier) {
                    const comment = "// namespace addition for " + myClassifier.name + "\n";
                    imports.language.add(Names.classifier(myClassifier));
                    this.importedNamespaceText += comment + `if (node instanceof ${myClassifier.name}) {`;
                    def.namespaceImports.nsInfoList.forEach((expression, index) => {
                        this.importedNamespaceText = this.importedNamespaceText.concat(
                          this.addNamespaceExpression(expression, imports, index),
                        );
                    });
                    this.importedNamespaceText = this.importedNamespaceText.concat(`}\n`);
                }
            }
        }
    }

    private makeAlternativeNamespaceTexts(scopedef: ScopeDef, imports: Imports) {
        for (const def of scopedef.scopeConceptDefs) {
            if (!!def.namespaceAlternatives) {
                // console.log('\tfound alternatives')
                const myClassifier: FreMetaClassifier | undefined = def.classifierRef?.referred;
                if (!!myClassifier) {
                    const comment = "// namespace replacement for " + myClassifier.name + "\n";
                    imports.language.add(Names.classifier(myClassifier));
                    this.alternativeNamespaceText += comment + `if (node instanceof ${myClassifier.name}) {`;
                    if (!!def.namespaceAlternatives) {
                        def.namespaceAlternatives.nsInfoList.forEach((expression, index) => {
                            this.alternativeNamespaceText = this.alternativeNamespaceText.concat(
                              this.addNamespaceExpression(expression, imports, index),
                            );
                        })
                    }
                    this.alternativeNamespaceText = this.alternativeNamespaceText.concat(`}\n`);
                }
            }
        }
    }

    private addNamespaceExpression(namespaceInfo: FreMetaNamespaceInfo, imports: Imports, index: number): string {
        let result: string = "";
        if (namespaceInfo.expression) {
            const namespaceExpressionStr: string = ExpressionGenerationUtil.langExpToTypeScript(namespaceInfo.expression, "node", imports, true);
            // see whether the expression results in a list, because we need to distinguish between lists and non-lists
            const previousIsList = ExpressionGenerationUtil.previousIsList;
            const lastExp = namespaceInfo.expression.getLastExpression()
            const isPart: boolean = lastExp.getIsPart()
            if (previousIsList) {
                const loopVar: string = "loopVariable";
                imports.core.add('isNullOrUndefined');
                imports.core.add('notNullOrUndefined');
                result = result.concat(`
                    // generated from '${namespaceInfo.toFreString()}'
                    const list${index} = ${namespaceExpressionStr}
                    if (notNullOrUndefined(list${index}) ){
                        for (let ${loopVar} of list${index++}) {
                            if (!isNullOrUndefined(${loopVar})) {
                                result.push(new ${Names.FreNamespaceInfo}<${Names.FreNode}>(${
                                    isPart
                                        ? `${loopVar}`
                                        : `{                        
                                    kind: "reference",
                                    pathname: ${loopVar}.pathname,
                                    typeName: ${loopVar}.typeName
                                }`
                                }, ${namespaceInfo.recursive}));
                            }
                        }
                    }`)
            } else {
                // try to determine the type of the node from the last of the chain of expressions
                let xxType = lastExp.getResultingClassifier()?.name;
                if (!isNullOrUndefined(xxType)) {
                    imports.language.add(xxType);
                }
                if (!isPart) {
                    xxType = `${Names.FreNodeReference}<${xxType}>`;
                    imports.core.add(Names.FreNodeReference);
                }
                // add core import
                imports.core.add('isNullOrUndefined');
                result = result.concat(`
                    // generated from '${namespaceInfo.toFreString()}'
                    const xx${index} ${xxType ? `: ${xxType} | undefined` : ``} = ${namespaceExpressionStr};
                    if (!isNullOrUndefined(xx${index})) { 
                        result.push(new ${Names.FreNamespaceInfo}<${Names.FreNode}>(${
                            isPart
                                ? `xx${index}`
                                : `{                        
                                    kind: "reference",
                                    pathname: xx${index}.pathname,
                                    typeName: xx${index}.typeName
                                }`
                        }, ${namespaceInfo.recursive}));
                    }`)
            }
        }
        return result;
    }
}
