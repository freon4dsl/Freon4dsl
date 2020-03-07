import { Names } from "../../../utils/Names";
import { PiLangEnumeration, PiLangType } from "../../metalanguage/PiLanguage";

export class TypeTemplate {
    constructor() {
    }

    generateType(type: PiLangType): string {
        // Dit moet het worden:
        // import { DemoEntity } from "./DemoEntity";
        // import { DemoAttributeType } from "./DemoAttributeType";
        // export type DemoType = DemoEntity | DemoAttributeType;

        const language = type.language;

        // Template starts here
        return `
        ${type.literals.map(lit => 
            `import { ${lit} } from "./${lit}"` ).join(";")}
    
        export type ${Names.type(type)} = ${type.literals.map(lit => 
                `${lit}` ).join(" | ")}
        `;
    }
}
