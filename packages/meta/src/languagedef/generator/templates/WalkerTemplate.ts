import { Names, PathProvider, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiLanguageUnit, PiLangClass } from "../../metalanguage/PiLanguage";
import { sortClasses } from "../../../utils/ModelHelpers";
import * as os from 'os';

export class WalkerTemplate {
    constructor() {
    }

    generateWalker(language: PiLanguageUnit, relativePath: string): string {
        const allLangConcepts : string = Names.allConcepts(language);   
        const generatedClassName : String = Names.walker(language);

        // Template starts here 
        return `
        import { ${allLangConcepts} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${language.classes.map(concept => `
                ${concept.name}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";     
        import { ${language.enumerations.map(concept => `
            ${concept.name}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";     

            // TODO change import to @project/core
        import { PiLogger } from "../../../../../core/src/util/PiLogging";
        import { ${Names.workerInterface(language)} } from "./${Names.workerInterface(language)}";
                
        const LOGGER = new PiLogger("${generatedClassName}");

        export class ${generatedClassName}  {
            myWorker : ${Names.workerInterface(language)};

            public walk(modelelement: ${allLangConcepts}, includeChildren?: boolean) {
                ${sortClasses(language.classes).map(concept => `
                if(modelelement instanceof ${concept.name}) {
                    return this.walk${concept.name}(modelelement, includeChildren );
                }`).join("")}
            }

            ${language.classes.map(concept => `
                public walk${concept.name}(modelelement: ${concept.name}, includeChildren?: boolean) {
                    if(!!this.myWorker) {

                    this.myWorker.execBefore${concept.name}(modelelement);

                    ${((concept.allParts().length > 0)?
                    ` // work on children in the model tree
                    if(!(includeChildren === undefined) && includeChildren) { 
                        ${concept.allParts().map( part =>
                            (part.isList ?
                                `modelelement.${part.name}.forEach(p => {
                                    this.walk(p, includeChildren );
                                });`
                            :
                                `this.walk(modelelement.${part.name}, includeChildren );`
                            )
                        ).join(os.EOL)}
                    }`
                    : ``
                    )}
                    this.myWorker.execAfter${concept.name}(modelelement);
                } else {
                    LOGGER.error(this, "No worker found.");
                    return;
                }
            }`).join(os.EOL)}

            ${language.enumerations.map(concept => `
            public walk${concept.name}(modelelement: ${concept.name}, includeChildren?: boolean) {
                if(!!this.myWorker) {
                    this.myWorker.execBefore${concept.name}(modelelement);
                    this.myWorker.execAfter${concept.name}(modelelement);
                }
            }`).join(os.EOL)}
        }`;
    }


}

