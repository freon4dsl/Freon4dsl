import { FreMetaClassifier, FreMetaLanguage, LangUtil } from '../../metalanguage/index.js';
import { Names, Imports } from "../../../utils/on-lang/index.js"

export class WalkerTemplate {
    // @ts-ignore TS6133
    generateWalker(language: FreMetaLanguage, relativePath: string): string {
        const allLangConcepts: string = Names.allConcepts();
        const generatedClassName: String = Names.walker(language);
        const classifiersToDo: FreMetaClassifier[] = [];
        // take care of the order, it is important
        classifiersToDo.push(...LangUtil.sortConceptsOrRefs(language.concepts));
        classifiersToDo.push(...language.units);
        classifiersToDo.push(language.modelConcept);
        const imports = new Imports(relativePath)
        imports.language = new Set<string>(classifiersToDo.map(c => Names.classifier(c)))
        imports.core = new Set<string>([ Names.FreLogger, Names.FreNode ])
        if (classifiersToDo.some(concept => concept.allParts().length > 0 && concept.allParts().some(part => part.isList))) {
          imports.core.add('notNullOrUndefined');
        }
        // Template starts here
        return `
        // TEMPLATE: WalkerTemplate.generateWalker(...)
        ${imports.makeImports(language)}
        import { type ${Names.workerInterface(language)} } from "./${Names.workerInterface(language)}.js";

        const LOGGER = new ${Names.FreLogger}("${generatedClassName}");

        /**
         * Class ${generatedClassName} implements the extended visitor pattern of instances of language ${language.name}.
         * This class implements the traversal of the model tree, classes that implement ${Names.workerInterface(language)}
         * are responsible for the actual work being done on the nodes of the tree.
         * Every node is visited twice, once before the visit of its children, and once after this visit.
         *
         * With the use of the parameter 'includeChildren', which takes a function, a very fine-grained control can be taken
         * over which nodes are and are not visited.
         */
        export class ${generatedClassName}  {
            myWorkers: ${Names.workerInterface(language)}[] = [];  // the instances that do the actual work on each node of the tree

            /**
             * This method is the entry point of the traversal through the model tree. Each of the workers will be called in
             * the order in which they are present in the array 'myWorkers'. If, for a tree node, a worker returns 'false',
             * none of the rest of the workers will be called. For that particular node both the 'execBefore' and 'execAfter'
             * method of any of the other workers will be skipped.
             *
             * @param node the top node of the part of the tree to be visited
             * @param includeChildren if true, the children of 'node' will also be visited
             */
            public walk(node: ${allLangConcepts}, includeChildren?: (elem: ${allLangConcepts}) => boolean) {
                if(this.myWorkers.length > 0) {
                    ${classifiersToDo
                        .map(
                            (concept) => `
                    if(node instanceof ${Names.classifier(concept)}) {
                        return this.walk${Names.classifier(concept)}(node, includeChildren );
                    }`,
                        )
                        .join("")}
                } else {
                    LOGGER.error( "No worker found.");
                }
            }

            ${classifiersToDo
                .map(
                    (concept) => `
                private walk${Names.classifier(concept)}(
                            node: ${Names.classifier(concept)},
                            includeChildren?: (elem: ${allLangConcepts}) => boolean) {
                    let stopWalkingThisNode: boolean = false;
                    for (const worker of this.myWorkers ) {
                        if (!stopWalkingThisNode ) {
                            stopWalkingThisNode = worker.execBefore${Names.classifier(concept)}(node);
                        }
                    }
                    ${
                        concept.allParts().length > 0
                            ? `// work on children in the model tree
                    ${concept
                        .allParts()
                        .map((part) =>
                            part.isList
                                ? `node.${part.name}.forEach(p => {
                                if(notNullOrUndefined(includeChildren) && includeChildren(p)) {
                                    this.walk(p, includeChildren );
                                }
                            });`
                                : `if(notNullOrUndefined(includeChildren) && notNullOrUndefined(node.${part.name})  && includeChildren(node.${part.name})) {
                                this.walk(node.${part.name}, includeChildren );
                            }`,
                        )
                        .join("\n")}
                    `
                            : ``
                    }
                    for (let worker of this.myWorkers ) {
                        if (!stopWalkingThisNode ) {
                            stopWalkingThisNode = worker.execAfter${Names.classifier(concept)}(node);
                        }
                    }
            }`,
                )
                .join("\n")}
        }`;
    }
}
