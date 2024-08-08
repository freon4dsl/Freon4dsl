import {FreMetaDefinitionElement} from "../../../utils/index.js";

export class FreEditBoolKeywords extends FreMetaDefinitionElement {
    trueKeyword: string = "true";
    falseKeyword?: string = undefined;

    toString(): string {
        return `BoolKeywords [ ${this.trueKeyword} | ${this.falseKeyword} ]`;
    }
}
