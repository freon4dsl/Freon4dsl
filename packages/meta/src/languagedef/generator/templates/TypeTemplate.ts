import { Names } from "../../../utils/Names";
import { PiLangUnion } from "../../metalanguage/PiLanguage";

export class UnionTemplate {
    constructor() {
    }

    generateUnion(union: PiLangUnion): string {

        // Template starts here
        return `
        ${union.members.map(lit => 
            `import { ${lit.name} } from "./${lit}"` ).join(";")}
    
        export type ${Names.type(union)} = ${union.members.map(lit => 
                `${lit.name}` ).join(" | ")}
        `;
    }
}
