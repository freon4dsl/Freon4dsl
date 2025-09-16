import { Names, Imports } from "../../../utils/on-lang/index.js"
import { FreMetaLanguage, FreMetaClassifier } from "../../../languagedef/metalanguage/index.js";

const paramName: string = "node";
const commentBefore = `/**
                        * Checks '${paramName}' before checking its children.
                        * Found errors are pushed onto 'errorlist'.
                        * If an error is found, it is NOT considered 'fatal', which means that other checks on
                        * '${paramName}' are performed.
                        *
                        * @param ${paramName}
                        */`;

export class NamespaceCheckerTemplate {
    done: FreMetaClassifier[] = [];

    generateChecker(language: FreMetaLanguage, relativePath: string): string {
        const defaultWorkerName = Names.defaultWorker(language);
        const errorClassName: string = Names.FreError;
        const errorSeverityName: string = Names.FreErrorSeverity;
        const checkerClassName: string = Names.namespaceChecker(language);
        const checkerInterfaceName: string = Names.checkerInterface(language);
        const writerInterfaceName: string = Names.FreWriter;
        const classifiersToDo: FreMetaClassifier[] = [];
        classifiersToDo.push(language.modelConcept);
        classifiersToDo.push(...language.units);
        classifiersToDo.push(...language.concepts);
        this.done = [];

        // the template starts here, imports are added after the generation
        const result = `
        /**
         * Class ${checkerClassName} is part of the implementation of the default validator.
         * It checks whether namespaces, as such defined in the .scope definition, have more than one node 
         * with the same name.
         * Class ${Names.walker(language)} implements the traversal of the model tree. This class implements
         * the actual checking of each node in the tree.
         */
        export class ${checkerClassName} extends ${defaultWorkerName} implements ${checkerInterfaceName} {
            // 'myWriter' is used to provide error messages on the nodes in the model tree
            myWriter: ${writerInterfaceName} = ${Names.FreLanguageEnvironment}.getInstance().writer;
            // 'errorList' holds the errors found while traversing the model tree
            errorList: ${errorClassName}[] = [];

        ${classifiersToDo.map((concept) => `${this.createChecksOnNamespaces(concept)}`).join("\n\n")}
        
        private checkDuplicateNamesInNamespace(node: FreNode) {
            const declaredNodes: Set<FreNamedNode> = FreNamespace.create(node).getDeclaredNodes(false);
            const declaredNames: string[] = [];
            const doubleNames: string[] = [];
            declaredNodes.forEach(nn => {
                if (declaredNames.indexOf(nn.name) > -1) {
                    doubleNames.push(nn.name);
                } else {
                    declaredNames.push(nn.name);
                }
            });
            if (doubleNames.length > 0) {
                const namespaceName: string = 'name' in node ? (node as FreNamedNode).name : '<unnamed>';
                this.errorList.push(new FreError(\`Namespace \${namespaceName} has multiple nodes with the same name [\${doubleNames.map(n => n).join(', ')}].\`, node, namespaceName, 'name', FreErrorSeverity.Error));
            }
        }
        }`;

        const imports = new Imports(relativePath)
        imports.core = new Set<string>([
            errorClassName, errorSeverityName, writerInterfaceName,
            Names.FreLanguageEnvironment, Names.FreLanguage, Names.FreNamespace, Names.FreNode, Names.FreNamedNode, Names.isNullOrUndefined
        ])
        imports.language = new Set<string>(this.done.map(cls => Names.classifier(cls)) )
        imports.utils.add(defaultWorkerName)
        
        return `
        // TEMPLATE: NamespaceCheckerTemplate.generateChecker(...)
        ${imports.makeImports(language)}
        import { type ${checkerInterfaceName} } from "./${Names.validator(language)}.js";
        
        ${result}`;
    }

    private createChecksOnNamespaces(concept: FreMetaClassifier): string {
        this.done.push(concept);
        return `${commentBefore}
                public execBefore${Names.classifier(concept)}(${paramName}: ${Names.classifier(concept)}): boolean {
                    if (!isNullOrUndefined(node) && FreLanguage.getInstance().classifier("${Names.classifier(concept)}").isNamespace) {
                        this.checkDuplicateNamesInNamespace(node);
                    }
                    return false;
                }`;
    }
}
