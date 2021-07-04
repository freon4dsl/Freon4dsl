var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { observable } from "mobx";
import { SBox } from "./SBox";
export class STextBox extends SBox {
    constructor(value) {
        super();
        this.kind = "TextBox";
        this.placeHolder = "<text>";
        this.getText = () => { return this.text; };
        this.setText = (value) => { this.text = value; };
        this.text = ""; // TODO for now
        /** @internal
         * This function is called after the text changes in the browser.
         * It ensures that the SelectableComponent will calculate the new coordinates.
         */
        this.update = () => {
            /* To be overwritten by `TextComponent` */
        };
        this.text = value;
    }
    isEditable() {
        return true;
    }
}
__decorate([
    observable,
    __metadata("design:type", String)
], STextBox.prototype, "placeHolder", void 0);
export function isTextBox(b) {
    return b instanceof STextBox;
}
//# sourceMappingURL=STextBox.js.map