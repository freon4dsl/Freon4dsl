import { Names } from "../../../utils";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";

export class InitalizationTemplate {
    constructor() {
    }

    generate(language: PiLanguageUnit): string {
        return `
            import { ${Names.concept(language.rootConcept)} } from "../language/gen";

             /**
             * Class ${Names.initialization(language)} provides an entry point for the language engineer to
             * initialize user models.
             * Default is to initialize a user model by creating an instance of the root concept of the language. 
             */         
            export class ${Names.initialization(language)} {
            
                initialize() {
                    // Add you initial model here            
                    return new ${Names.concept(language.rootConcept)}();
                }
            }
        `;
    }
}
