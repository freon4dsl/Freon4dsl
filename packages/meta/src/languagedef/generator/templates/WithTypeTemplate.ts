import { PiLanguage } from "../../metalanguage/PiLanguage";
import { Names } from "../../../utils/Names";

export class WithTypeTemplate {
    constructor() {
    }

    generateTypeInterface(language: PiLanguage) : string {
        return `
            import { ${language.name}ConceptType } from "./${language.name}";
            import { PiElement } from "@projectit/core";
            
            export interface ${Names.withTypeInterface(language)} extends PiElement {
                get$Type(): ${language.name}ConceptType;
            }
        `;
    }
}
