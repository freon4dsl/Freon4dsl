import { Names } from "../../../utils/Names";
import { PiLanguage } from "../../metalanguage/PiLanguage";

export class IndexTemplate {
    constructor() {
    }

    generateIndex(language: PiLanguage): string {
        // sort all names alphabetically
        let tmp : string[] = [];
        language.concepts.map(c =>
            tmp.push(Names.concept(c))
        );
        language.interfaces.map(c =>
            tmp.push(Names.interface(c))
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
