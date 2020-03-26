import { Names } from "../../../utils/Names";
import { PiLanguageUnit } from "../../metalanguage/PiLanguage";

export class WalkerTemplate {
    constructor() {
    }

    generateWalker(language: PiLanguageUnit): string {
        const allLangConcepts : string = Names.allConcepts(language);   
        const langConceptType : string = Names.languageConceptType(language);     
        const generatedClassName : String = Names.walker(language);

        // Template starts here 
        return `
        import { ${allLangConcepts} } from "../../language";
        import { ${langConceptType} } from "../../language/${language.name}";   
        import { ${language.classes.map(concept => `
                ${concept.name}`).join(", ")} } from "../../language";     
        // TODO change import to @project/core
        import { PiLogger } from "../../../../../core/src/util/PiLogging";
        import { ${Names.workerInterface(language)} } from "./${Names.workerInterface(language)}";
                
        const LOGGER = new PiLogger("${generatedClassName}");

        export class ${generatedClassName}  {
            myWorker : ${Names.workerInterface(language)};

            public walk(modelelement: ${allLangConcepts}, includeChildren?: boolean) {
                ${language.classes.map(concept => `
                if(modelelement instanceof ${concept.name}) {
                    this.walk${concept.name}(modelelement, includeChildren );
                }`).join("")}
            }

            ${language.classes.map(concept => `
                public walk${concept.name}(modelelement: ${concept.name}, includeChildren?: boolean) {
                    if(!!this.myWorker) {

                    // do the work
                    this.myWorker.exec${concept.name}(modelelement);

                    ${((concept.allParts().length > 0)?
                    ` // work on children in the model tree
                    if(!(includeChildren === undefined) && includeChildren) { 
                        ${concept.allParts().map( part =>
                            (part.isList ?
                                `modelelement.${part.name}.forEach(p => {
                                    this.walk${part.type.name}(p, includeChildren );
                                });`
                            :
                                `this.walk${part.type.name}(modelelement.${part.name}, includeChildren );`
                            )
                        ).join("\n")}
                    }`
                    : ``
                    )}
                } else {
                    LOGGER.error(this, "No worker found.");
                    return;
                }
                
                }`).join("\n")}
        }`;
    }
}
// ${concept.allSubConceptsDirect().length > 0? `// use the right worker function` : ``}
// ${concept.allSubConceptsDirect().map ( sub =>
//     `if( modelelement instanceof ${sub.name}) {
//         this.walk${sub.name}(modelelement, includeChildren);
//     }`
// ).join("\n")}

