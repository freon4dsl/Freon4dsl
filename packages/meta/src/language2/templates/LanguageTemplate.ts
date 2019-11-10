import { PiLanguage } from "../PiLanguage";
import { PiLanguageDef } from "../PiLanguageDef";

export class LanguageTemplates {
    constructor() {
    }

    generateLanguage(lang: PiLanguageDef, language: PiLanguage): string {
        return `
        // import { PiLanguageDef } from "../PiLanguageDef";
    
        export type ${language.name}ConceptType = ${language.concepts.map(c => `"${c.name}"`).join(" | ")};            
    
        `;
        // export const ${lang.name} : PiLanguageDef =
        // ${JSON.stringify(lang, null, 4)};
    }

}
