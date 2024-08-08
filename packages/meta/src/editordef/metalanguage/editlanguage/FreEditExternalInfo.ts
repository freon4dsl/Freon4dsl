import {FreMetaDefinitionElement} from "../../../utils/index.js";
import {FreEditKeyValuePair} from "./FreEditKeyValuePair.js";

/**
 * This class holds all the information that is needed to include an external component in the editor.
 * It is used in FreEditExternalProjection, and in FreEditPropertyProjection.
 */
export class FreEditExternalInfo extends FreMetaDefinitionElement {
    externalName: string = '';
    positionInProjection: string | undefined;
    params: FreEditKeyValuePair[] = [];

    toString(): string {
        const posInProjStr: string = `${!!this.positionInProjection ? `:${this.positionInProjection}` : ``}`;
        const paramsStr: string = `${this.params.length > 0 ? ` ${this.params.map(p => p.toString()).join(" ")}` : ``}`;
        return `external = ${this.externalName}${posInProjStr}${paramsStr}`
    }

    /**
     * To be used in ProjectionTemplate
     */
    roleString(): string {
        return `${this.externalName}${!!this.positionInProjection ? `-${this.positionInProjection}` : ``}`;
    }
}
