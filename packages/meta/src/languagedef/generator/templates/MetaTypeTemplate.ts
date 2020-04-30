import { PiLanguageUnit } from "../../metalanguage/PiLanguage";
import { Names } from "../../../utils/Names";

export class MetaTypeTemplate {
    constructor() {
    }

    generateMetaType(language: PiLanguageUnit): string {
        // TODO should interfaces be add to MetaType?
        return `
        export type ${Names.metaType(language)} = 
        ${language.concepts.map(c => `"${c.name}"`).join(" | ")}
        `;
    }

}
