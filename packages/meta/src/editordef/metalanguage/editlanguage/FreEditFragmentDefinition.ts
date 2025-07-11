import { FreMetaDefinitionElement } from "../../../utils/no-dependencies/index.js";
import { FreEditClassifierProjection, FreEditNormalProjection } from "./internal.js";

export class FreEditFragmentDefinition extends FreMetaDefinitionElement {
    name: string = "";
    wrapperInfo: string | undefined = undefined;
    // @ts-ignore this property is set during parsing
    childProjection: FreEditNormalProjection;
    // @ts-ignore this property is set during checking
    belongsTo: FreEditClassifierProjection;

    toString(): string {
        const wrapperInfoStr: string = `${!!this.wrapperInfo ? ` wrap = ${this.wrapperInfo}` : ``}`;
        return `fragment ${this.name}${wrapperInfoStr} ${this.childProjection}`;
    }
}
