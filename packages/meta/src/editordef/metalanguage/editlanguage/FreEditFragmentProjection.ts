import {FreMetaDefinitionElement} from "../../../utils/index.js";
import {FreEditExternalInfo} from "./FreEditExternalInfo.js";

export class FreEditFragmentProjection extends FreMetaDefinitionElement {
    name: string = '';
    wrapperInfo: FreEditExternalInfo | undefined;

    toString(): string {
        // projection_begin "fragment" ws name:var ws ext:external_info? projection_end
        return `[fragment ${this.name} ${this.wrapperInfo? `${this.wrapperInfo.toString()}`: ``}]`;
    }
}
