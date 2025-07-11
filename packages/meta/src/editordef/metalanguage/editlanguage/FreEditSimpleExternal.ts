import { FreMetaDefinitionElement } from "../../../utils/no-dependencies/index.js";
import { FreEditKeyValuePair } from "./internal.js";

/**
 * Represents a projection item that is not linked to the AST. It is used to introduce extra
 * elements in the editor, like a button, or image.
 */
export class FreEditSimpleExternal extends FreMetaDefinitionElement {
    // @ts-ignore this property is set during parsing
    name: string | undefined;
    params: FreEditKeyValuePair[] = [];

    toString(): string {
        const paramsStr: string = `${this.params.length > 0 ? ` ${this.params.map((p) => p.toString()).join(" ")}` : ``}`;
        return `[external = ${this.name}${paramsStr}]`;
    }
}
