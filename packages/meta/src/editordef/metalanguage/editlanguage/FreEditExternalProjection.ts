import {FreMetaDefinitionElement} from "../../../utils/index.js";
import {FreEditExternalInfo} from "./internal.js";

/**
 * Represents a projection item that is not linked to the AST. It is used to introduce extra
 * elements in the editor, like a button, or image.
 */
export class FreEditExternalProjection extends FreMetaDefinitionElement {
    // @ts-ignore this property is set during parsing
    externalInfo: FreEditExternalInfo;

    toString() {
        return `[ ${this.externalInfo} ]`
    }
}


