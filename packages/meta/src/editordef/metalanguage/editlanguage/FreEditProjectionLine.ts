import { FreMetaDefinitionElement } from "../../../utils/no-dependencies/index.js";
import type {
    FreEditProjectionItem} from "./internal.js";
import {
    FreEditParsedNewline,
    FreEditParsedProjectionIndent,
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
          this.items.length === 0 || this.items.every((i) => i instanceof FreEditParsedNewline || i instanceof FreEditParsedProjectionIndent)
        );
    }

    isOptional(): boolean {
        return this.items.every((i) => i instanceof FreOptionalPropertyProjection);
    }

    toString(): string {
        return "#indents: [" + this.indent + "] " + this.items.map((item) => item.toString()).join("");
    }
}
