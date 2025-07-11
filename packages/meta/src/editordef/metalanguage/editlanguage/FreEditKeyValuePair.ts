import { FreMetaDefinitionElement } from "../../../utils/no-dependencies/index.js";

export class FreEditKeyValuePair extends FreMetaDefinitionElement {
    key: string = "";
    value: string = "";

    toString(): string {
        return `${this.key} = "${this.value}"`;
    }
}
