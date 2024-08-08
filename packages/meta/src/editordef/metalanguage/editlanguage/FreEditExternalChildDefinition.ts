import {FreMetaDefinitionElement} from "../../../utils/index.js";
import {FreEditClassifierProjection, FreEditNormalProjection} from "./internal.js";

export class FreEditExternalChildDefinition extends FreMetaDefinitionElement {
    externalName: string = '';
    positionInProjection: string | undefined = undefined;
    // @ts-ignore this property is set during parsing
    childProjection: FreEditNormalProjection;
    // @ts-ignore this property is set during checking
    belongsTo: FreEditClassifierProjection;

    toString(): string {
        const posInProjStr: string = `${!!this.positionInProjection ? `:${this.positionInProjection}` : ``}`;
        return `external = ${this.externalName}${posInProjStr} [${this.childProjection}]`
    }
}
