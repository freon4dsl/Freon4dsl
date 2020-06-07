import { LANGUAGE_GEN_FOLDER, Names } from "../../../utils";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";

export class InitalizationTemplate {
    constructor() {
    }

    generate(language: PiLanguageUnit, relativePath: string): string {
        return `
            import { ${Names.concept(language.rootConcept)} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";

             /**
             * Class ${Names.initialization(language)} provides an entry point for the language engineer to
             * initialize user models.
             * Default is to initialize a user model by creating an instance of the first root concept of the language. 
             */         
            export class ${Names.initialization(language)} {
            
                initialize() {
                    // Add you initial model(s) here     
                    return new ${Names.concept(language.rootConcept)}();
                }
            }
        `;
    }
}
