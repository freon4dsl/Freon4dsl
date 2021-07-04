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
export class SListBox extends SBox {
    constructor() {
        super();
        this.direction = "horizontal";
        this.boxes = [];
        this.kind = "ListBox";
    }
    static create() {
        return new SListBox();
    }
}
__decorate([
    observable,
    __metadata("design:type", Array)
], SListBox.prototype, "boxes", void 0);
export function isListBox(b) {
    return b.kind === "ListBox";
}
//# sourceMappingURL=SListBox.js.map