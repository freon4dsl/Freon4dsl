import { PiClassifier, PiLanguage } from "../../metalanguage";
import { Names, LANGUAGE_GEN_FOLDER, GenerationUtil } from "../../../utils";

export class WalkerTemplate {

    generateWalker(language: PiLanguage, relativePath: string): string {
        const allLangConcepts: string = Names.allConcepts(language);
        const generatedClassName: String = Names.walker(language);
        const classifiersToDo: PiClassifier[] = [];
        // take care of the order, it is important
        classifiersToDo.push(...GenerationUtil.sortConceptsOrRefs(language.concepts));
        classifiersToDo.push(...language.units);
        classifiersToDo.push(language.modelConcept);

        // Template starts here
        return `
        import { ${allLangConcepts} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${classifiersToDo.map(concept => `
                ${Names.classifier(concept)}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";      
        import { ${Names.workerInterface(language)} } from "./${Names.workerInterface(language)}";
        import { PiLogger } from "@projectit/core";
                
        const LOGGER = new PiLogger("${generatedClassName}");

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
             * @param modelelement the top node of the part of the tree to be visited
             * @param includeChildren if true, the children of 'modelelement' will also be visited
             */
            public walk(modelelement: ${allLangConcepts}, includeChildren?: (elem: ${allLangConcepts}) => boolean) {
                if(this.myWorkers.length > 0) {
                    ${classifiersToDo.map(concept => `
                    if(modelelement instanceof ${Names.classifier(concept)}) {
                        return this.walk${Names.classifier(concept)}(modelelement, includeChildren );
                    }`).join("")}
                } else {
                    LOGGER.error(this, "No worker found.");
                }
            }

            ${classifiersToDo.map(concept => `
                private walk${Names.classifier(concept)}(
                            modelelement: ${Names.classifier(concept)}, 
                            includeChildren?: (elem: ${allLangConcepts}) => boolean) {
                    let stopWalkingThisNode: boolean = false;
                    for (const worker of this.myWorkers ) {
                        if (!stopWalkingThisNode ) {
                            stopWalkingThisNode = worker.execBefore${Names.classifier(concept)}(modelelement);
                        }
                    }
                    ${((concept.allParts().length > 0) ?
                    `// work on children in the model tree                     
                    ${concept.allParts().map( part =>
                        (part.isList ?
                            `modelelement.${part.name}.forEach(p => {
                                if(!(includeChildren === undefined) && includeChildren(p)) {                                    
                                    this.walk(p, includeChildren );
                                }
                            });`
                        :
                            `if(!(includeChildren === undefined) && includeChildren(modelelement.${part.name})) {
                                this.walk(modelelement.${part.name}, includeChildren );
                            }`
                        )
                    ).join("\n")}
                    `
                    : ``
                    )}
                    for (let worker of this.myWorkers ) {                    
                        if (!stopWalkingThisNode ) {
                            stopWalkingThisNode = worker.execAfter${Names.classifier(concept)}(modelelement);
                        }
                    }
            }`).join("\n")}
        }`;
    }
}
