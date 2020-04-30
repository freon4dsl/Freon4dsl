import { Names } from "../../../utils";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";

export class InitalizationTemplate {
    constructor() {
    }

    generate(language: PiLanguageUnit): string {
        return `
            export class ${Names.initialization(language)} {
            
                initialize() {
                    // Add you initial model here            
                    return null;
                }
            }
        `;
    }
}
