import { Names } from "../../../utils/Names";
import { PiLangUnion } from "../../metalanguage/PiLanguage";

export class UnionTemplate {
    constructor() {
    }

    generateUnion(union: PiLangUnion): string {

        // Template starts here
        return `
        ${union.literals.map(lit => 
            `import { ${lit} } from "./${lit}"` ).join(";")}
    
        export type ${Names.type(union)} = ${union.literals.map(lit => 
                `${lit}` ).join(" | ")}
        `;
    }
}
