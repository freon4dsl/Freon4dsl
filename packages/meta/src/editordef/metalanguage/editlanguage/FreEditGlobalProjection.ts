import { FreMetaDefinitionElement } from "../../../utils/no-dependencies/index.js";
import { DisplayType, FreEditBoolKeywords } from "./internal.js";

/**
 * A single definition of the global for properties with primitive type, or the reference separator
 */
export class FreEditGlobalProjection extends FreMetaDefinitionElement {
    for: string = "";
    displayType: DisplayType | undefined; // Possible values: 'text', 'checkbox', 'radio', 'switch', 'inner-switch'. See BooleanBox.ts from core.
    keywords: FreEditBoolKeywords | undefined;
    separator: string | undefined;
    externals: string[] = [];

    toString(): string {
        const displayTypeStr: string = `${this.displayType ? ` ${this.displayType}` : ""}`;
        const keywordsStr: string = `${this.keywords ? ` ${this.keywords.toString()}` : ""}`;
        const separatorStr: string = `${this.separator ? ` [${this.separator}]` : ""}`;
        let externalsStr: string = "";
        externalsStr = `${this.externals.length > 0 ? ` { ${this.externals} }` : ""}`;

        return `${this.for}${displayTypeStr}${keywordsStr}${separatorStr}${externalsStr}`;
    }
}
