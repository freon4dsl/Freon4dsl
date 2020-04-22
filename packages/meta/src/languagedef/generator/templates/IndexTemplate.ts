import { Names } from "../../../utils/Names";
import { PiLanguageUnit } from "../../metalanguage/PiLanguage";

export class IndexTemplate {
    constructor() {
    }

    generateIndex(language: PiLanguageUnit): string {
        // sort all names alphabetically
        let tmp : string[] = [];
        language.classes.map(c =>
            tmp.push(Names.concept(c))
        );
        language.interfaces.map(c =>
            tmp.push(Names.interface(c))
        );
        language.enumerations.map(c =>
            tmp.push(Names.enumeration(c))
        );
        language.unions.map(c =>
            tmp.push(Names.union(c))
        );
        tmp.push(Names.allConcepts(language));
        tmp.push(Names.metaType(language));

        tmp = tmp.sort();

        // the template starts here
        return `
        ${tmp.map(c => 
            `export * from "./${c}";`
        ).join("\n")}
        export * from "./PiElementReference";
        `;
    }

}
