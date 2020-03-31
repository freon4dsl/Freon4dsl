import { Names } from "../../../utils/Names";
import { PathProvider } from "../../../utils/PathProvider";
import { PiLangUnion } from "../../metalanguage/PiLanguage";

export class UnionTemplate {
    constructor() {
    }

    generateUnion(union: PiLangUnion, relativePath: string): string {
        const language = union.language;

        // Template starts here
        return `
        ${union.members.map(lit => 
            `import { ${lit.name} } from "./${lit.name}"` ).join(";")}
    
        export type ${Names.union(union)} = ${union.members.map(lit => 
                `${lit.name}` ).join(" | ")}
        `;
    }
}
