import { Names } from "../../../utils/Names";
import { PathProvider } from "../../../utils/PathProvider";
import { PiLanguageUnit, PiLangClass } from "../../metalanguage/PiLanguage";

export class WalkerTemplate {
    constructor() {
    }

    generateWalker(language: PiLanguageUnit, relativePath: string): string {
        const allLangConcepts : string = Names.allConcepts(language);   
        const generatedClassName : String = Names.walker(language);

        // Template starts here 
        return `
        import { ${allLangConcepts} } from "${relativePath}${PathProvider.languageGenFolder}";
        import { ${language.classes.map(concept => `
                ${concept.name}`).join(", ")} } from "${relativePath}${PathProvider.languageGenFolder}";     
        import { ${language.enumerations.map(concept => `
            ${concept.name}`).join(", ")} } from "${relativePath}${PathProvider.languageGenFolder}";     

            // TODO change import to @project/core
        import { PiLogger } from "../../../../../core/src/util/PiLogging";
        import { ${Names.workerInterface(language)} } from "./${Names.workerInterface(language)}";
                
        const LOGGER = new PiLogger("${generatedClassName}");

        export class ${generatedClassName}  {
            myWorker : ${Names.workerInterface(language)};

            public walk(modelelement: ${allLangConcepts}, includeChildren?: boolean) {
                ${this.sortClasses(language.classes).map(concept => `
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
                        ).join("\n")}
                    }`
                    : ``
                    )}
                    this.myWorker.execAfter${concept.name}(modelelement);
                } else {
                    LOGGER.error(this, "No worker found.");
                    return;
                }
            }`).join("\n")}

            ${language.enumerations.map(concept => `
            public walk${concept.name}(modelelement: ${concept.name}, includeChildren?: boolean) {
                if(!!this.myWorker) {
                    this.myWorker.execBefore${concept.name}(modelelement);
                    this.myWorker.execAfter${concept.name}(modelelement);
                }
            }`).join("\n")}
        }`;
    }

    // the entries for the walk${concept.name} must be sorted,
    // because an entry for a subclass must preceed an entry for
    // its base class, otherwise only the walk${concept.name} for
    // the base class will be called.
    private sortClasses(piclasses: PiLangClass[]) : PiLangClass[] {
        let newList : PiLangClass[] = [];
        for (let c of piclasses) {
            // without base must be last
            if ( !c.base ) {
                newList.push(c);
            }
        }
        while (newList.length < piclasses.length) {
            for (let c of piclasses) {
                if ( c.base ) {
                    // push c before c.base
                    if (newList.includes(c.base.referedElement())) {
                        newList.unshift(c);
                    }
                }
            }
        }
        return newList;
    }

}

