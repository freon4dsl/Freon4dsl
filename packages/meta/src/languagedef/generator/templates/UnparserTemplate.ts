import { Names } from "../../../utils/Names";
import { PiLanguageUnit, PiLangClass } from "../../metalanguage/PiLanguage";

export class UnparserTemplate {
    constructor() {
    }

    generateUnparser(language: PiLanguageUnit): string {
        const allLangConcepts : string = Names.allConcepts(language);   
        const generatedClassName : String = Names.unparser(language);
        // TODO use the editor definition language to create the bodies of the functions

        // Template starts here 
        return `
        import { ${allLangConcepts} } from "../../language";
        import { ${language.classes.map(concept => `
                ${concept.name}`).join(", ")} } from "../../language";     
        // TODO change import to @project/core
        import { PiLogger } from "../../../../../core/src/util/PiLogging";
                
        const LOGGER = new PiLogger("${generatedClassName}");

        // For now, we generate an empty template class as unparser. 
        // When the editor definition language is finished, the .edit file
        // will be used to generate the bodies of the functions below.
        export class ${generatedClassName}  {

            public uparse(modelelement: ${allLangConcepts}) : string {
                ${this.sortClasses(language.classes).map(concept => `
                if(modelelement instanceof ${concept.name}) {
                    return this.unparse${concept.name}(modelelement);
                }`).join("")}
            }

            ${language.classes.map(concept => `
                private unparse${concept.name}(modelelement: ${concept.name}) : string {
                    return "";
                }`).join("\n")}
        }`;
    }

    // As in the WalkerTemplate,
    // the entries for the unparse${concept.name} must be sorted,
    // because an entry for a subclass must preceed an entry for
    // its base class, otherwise only the unparse${concept.name} for
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

