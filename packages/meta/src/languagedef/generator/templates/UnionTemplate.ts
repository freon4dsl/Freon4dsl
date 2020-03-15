import { Names } from "../../../utils/Names";
import { PiLangEnumeration, PiLangUnion } from "../../metalanguage/PiLanguage";

export class UnionTemplate {
    constructor() {
    }

    generateUnion(union: PiLangUnion): string {
        const language = union.language;

        // Template starts here
        return `
        ${union.members.map(lit => 
            `import { ${lit} } from "./${lit}"` ).join(";")}
    
        export type ${Names.type(union)} = ${union.members.map(lit => 
                `${lit}` ).join(" | ")}
        `;
    }
}
