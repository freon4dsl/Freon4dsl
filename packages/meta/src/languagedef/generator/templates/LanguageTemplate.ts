import { PiLanguageUnit } from "../../metalanguage/PiLanguage";

export class LanguageTemplates {
    constructor() {
    }

    generateLanguage(language: PiLanguageUnit): string {

        return `
        export type ${language.name}ConceptType = 
        ${language.enumerations.length > 0 ? `${language.enumerations.map(c => `"${c.name}"`).join(" | ")} |` : ""}
        ${language.classes.map(c => `"${c.name}"`).join(" | ")}
        `;
    }

}
