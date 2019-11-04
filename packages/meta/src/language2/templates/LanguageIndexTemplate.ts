import { Names } from "./Names";
import { PiLanguage } from "../PiLanguage";

export class LanguageIndexTemplate {
    constructor() {
    }

    generateIndex(language: PiLanguage): string {
        return `
        export * from "./WithType";
        ${language.concepts.map(c => 
            `export * from "./${Names.concept(c)}";`
        ).join("\n")}
        `;
    }

}
