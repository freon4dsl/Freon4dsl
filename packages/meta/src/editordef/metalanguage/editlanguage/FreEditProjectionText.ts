import {FreMetaDefinitionElement} from "../../../utils/index.js";

/**
 * An element of a line in a projection definition that holds a (simple) text.
 */
export class FreEditProjectionText extends FreMetaDefinitionElement {
    public static create(text: string): FreEditProjectionText {
        const result = new FreEditProjectionText();
        result.text = text;
        return result;
    }

    text: string = "";

    toString(): string {
        return this.text;
    }
}
