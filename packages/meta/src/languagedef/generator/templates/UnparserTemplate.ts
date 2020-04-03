import { Names, PathProvider, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiLanguageUnit, PiLangClass } from "../../metalanguage/PiLanguage";
import { sortClasses } from "../../../utils/ModelHelpers";

export class UnparserTemplate {
    constructor() {
    }

    generateUnparser(language: PiLanguageUnit, relativePath: string): string {
        const allLangConcepts : string = Names.allConcepts(language);   
        const generatedClassName : String = Names.unparser(language);
        // TODO use the editor definition language to create the bodies of the functions

        // Template starts here 
        return `
        import { ${allLangConcepts} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${language.classes.map(concept => `
                ${concept.name}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";     
        import { ${language.enumerations.map(concept => `
                ${concept.name}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";     
        // TODO change import to @project/core
        import { PiLogger } from "../../../../../core/src/util/PiLogging";
                
        const LOGGER = new PiLogger("${generatedClassName}");

        // For now, we generate an empty template class as unparser. 
        // When the editor definition language is finished, the .edit file
        // will be used to generate the bodies of the functions below.
        export class ${generatedClassName}  {

            public unparse(modelelement: ${allLangConcepts}) : string {
                ${sortClasses(language.classes).map(concept => `
                if(modelelement instanceof ${concept.name}) {
                    return this.unparse${concept.name}(modelelement);
                }`).join("")}
                ${language.enumerations.map(concept => `
                if(modelelement instanceof ${concept.name}) {
                    return this.unparse${concept.name}(modelelement);
                }`).join("")}
           }

            ${language.classes.map(concept => `
                private unparse${concept.name}(modelelement: ${concept.name}) : string {
                    return "";
                }`).join("\n")}
            ${language.enumerations.map(concept => `
                private unparse${concept.name}(modelelement: ${concept.name}) : string {
                    return "";
                }`).join("\n")}
            }`;
    }


}

