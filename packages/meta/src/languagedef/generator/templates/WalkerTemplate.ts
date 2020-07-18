import { Names, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiLanguageUnit } from "../../metalanguage/PiLanguage";
import { sortClasses } from "../../../utils/ModelHelpers";

export class WalkerTemplate {
    constructor() {
    }

    generateWalker(language: PiLanguageUnit, relativePath: string): string {
        const allLangConcepts : string = Names.allConcepts(language);   
        const generatedClassName : String = Names.walker(language);

        // Template starts here 
        return `
        import { ${allLangConcepts} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${language.concepts.map(concept => `
                ${concept.name}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";      
        import { ${Names.workerInterface(language)} } from "./${Names.workerInterface(language)}";
        // TODO change import to @project/core
        import { PiLogger } from "../../../../../core/src/util/PiLogging";
                
        const LOGGER = new PiLogger("${generatedClassName}");

        /**
         * Class ${generatedClassName} implements the extended visitor pattern of instances of language ${language.name}.
         * This class implements the traversal of the model tree, classes that implement ${Names.workerInterface(language)} 
         * are responsible for the actual work being done on the nodes of the tree.        
         * Every node is visited twice, once before the visit of its children, and once after this visit.
         */
        export class ${generatedClassName}  {
            myWorker : ${Names.workerInterface(language)};  // the instance that does the actual work on each node of the tree

            /**
             * This method is the entry point of the traversal through the model tree.
             * @param modelelement the top node of the part of the tree to be visited
             * @param includeChildren if true, the children of 'modelelement' will also be visited
             */
            public walk(modelelement: ${allLangConcepts}, includeChildren?: (elem: ${allLangConcepts}) => boolean) {
                ${sortClasses(language.concepts).map(concept => `
                if(modelelement instanceof ${concept.name}) {
                    return this.walk${concept.name}(modelelement, includeChildren );
                }`).join("")}
            }

            ${language.concepts.map(concept => `
                private walk${concept.name}(modelelement: ${concept.name}, includeChildren?: (elem: ${allLangConcepts}) => boolean) {
                    if(!!this.myWorker) {
                        this.myWorker.execBefore${concept.name}(modelelement);
                        ${((concept.allParts().length > 0)?
                        ` // work on children in the model tree
                        if(!(includeChildren === undefined) && includeChildren(modelelement)) { 
                            ${concept.allParts().map( part =>
                                (part.isList ?
                                    `modelelement.${part.name}.forEach(p => {
                                        this.walk(p, includeChildren );
                                    });`
                                :
                                    `this.walk(modelelement.${part.name}, includeChildren );`
                                )
                            ).join("\n")}
                        }`
                        : ``
                        )}
                        this.myWorker.execAfter${concept.name}(modelelement);
                } else {
                    LOGGER.error(this, "No worker found.");
                }
            }`).join("\n")}
        }`;
    }
}

