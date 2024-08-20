import { FreMetaDefinitionElement } from "../../../utils/index.js";
import {
    FreEditParsedNewline,
    FreEditParsedProjectionIndent,
    FreEditProjectionItem,
    FreOptionalPropertyProjection,
} from "./internal.js";

/**
 * One of the lines in a 'normal' projection definition
 */
export class FreEditProjectionLine extends FreMetaDefinitionElement {
    items: FreEditProjectionItem[] = [];
    indent: number = 0; // this number is calculated by FreEditParseUtil.normalize()

    isEmpty(): boolean {
        return (
            this.items.every((i) => i instanceof FreEditParsedNewline || i instanceof FreEditParsedProjectionIndent) ||
            this.items.length === 0
        );
    }

    isOptional(): boolean {
        return this.items.every((i) => i instanceof FreOptionalPropertyProjection);
    }

    toString(): string {
        return "#indents: [" + this.indent + "] " + this.items.map((item) => item.toString()).join("");
    }
}
