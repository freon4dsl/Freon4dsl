import { Names } from "../../../utils";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";

export class InitalizationTemplate {
    constructor() {
    }

    generate(language: PiLanguageUnit): string {
        let imports: string = language.rootConcepts.map(con => {
            `${Names.concept(con)}`
        }).join(", ");
        return `
            import { ${imports} } from "../language/gen";

             /**
             * Class ${Names.initialization(language)} provides an entry point for the language engineer to
             * initialize user models.
             * Default is to initialize a user model by creating an instance of the first root concept of the language. 
             */         
            export class ${Names.initialization(language)} {
            
                initialize() {
                    // Add you initial model(s) here     
                    return new ${language.rootConcepts[0]}();
                }
            }
        `;
    }
}
