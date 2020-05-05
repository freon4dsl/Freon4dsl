import { Names } from "../../../utils";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";

export class InitalizationTemplate {
    constructor() {
    }

    generate(language: PiLanguageUnit): string {
        return `
            import { ${Names.concept(language.rootConcept)} } from "../language/gen";
        
            export class ${Names.initialization(language)} {
            
                initialize() {
                    // Add you initial model here            
                    return new ${Names.concept(language.rootConcept)}();
                }
            }
        `;
    }
}
