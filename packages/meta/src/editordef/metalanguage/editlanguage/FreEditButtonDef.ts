import { FreMetaDefinitionElement } from "../../../utils/no-dependencies/index.js";

export class FreEditButtonDef extends FreMetaDefinitionElement {
    text: string = "";
    boxRole: string = "unknown-box-role";

    toString(): string {
        return `[button ${!!this.text && this.text.length > 0 ? `text="${this.text}" ` : ``}boxRole="${this.boxRole}"]`;
    }
}
