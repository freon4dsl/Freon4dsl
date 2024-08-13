import {FreMetaDefinitionElement} from "../../../utils/index.js";
import {FreEditKeyValuePair} from "./FreEditKeyValuePair.js";

/**
 * This class holds all the information that is needed to wrap or replace a property projection by
 * an external component in the editor. It is used in FreEditPropertyProjection.
 */
export class FreEditExternalInfo extends FreMetaDefinitionElement {
    wrapBy: string | undefined;
    replaceBy: string | undefined;
    params: FreEditKeyValuePair[] = [];

    toString(): string {
        const paramsStr: string = `${this.params.length > 0 ? ` ${this.params.map(p => p.toString()).join(" ")}` : ``}`;
        return `${this.wrapBy? `wrap = ${this.wrapBy}` : ``}${this.replaceBy? `replace = ${this.replaceBy}` : ``}${paramsStr}`
    }

    /**
     * To be used in ProjectionTemplate
     */
    roleString(): string {
        // todo
        return `to do`;
    }
}
