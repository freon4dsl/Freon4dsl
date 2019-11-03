import { PiLanguage } from "../PiLanguage";

export class WithTypeTemplate {
    constructor() {
    }

    generateTypeInterface(language: PiLanguage) : string {
        return `
            import { ${language.name}ConceptType } from "./${language.name}";
            import { PiElement } from "@projectit/core";
            
            export interface WithType extends PiElement {
                get$Type(): ${language.name}ConceptType;
            }
        `;
    }
}
