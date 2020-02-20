import { PiLanguage } from "../../../metalanguage/PiLanguage";

export class LanguageTemplates {
    constructor() {
    }

    generateLanguage(language: PiLanguage): string {
        return `
      
        export type ${language.name}ConceptType = ${language.concepts.map(c => `"${c.name}"`).join(" | ")};            
    
        `;
    }

}
