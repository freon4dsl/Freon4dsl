import { PiLanguageUnit } from "../../metalanguage/PiLanguage";
import { Names } from "../../../utils/Names";

export class MetaTypeTemplate {
    constructor() {
    }

    generateMetaType(language: PiLanguageUnit): string {

        return `
        export type ${Names.metaType(language)} = 
        ${language.enumerations.length > 0 ? `${language.enumerations.map(c => `"${c.name}"`).join(" | ")} |` : ""}
        ${language.classes.map(c => `"${c.name}"`).join(" | ")}
        `;
    }

}
