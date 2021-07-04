import { observable } from "mobx";
import { SBox } from "./SBox";


export class SListBox extends SBox {

    static create(): SListBox {
        return new SListBox();
    }

    direction: string = "horizontal";
    @observable boxes: SBox[] = [];
    kind = "ListBox";

    constructor() {
        super();
    }
}

export function isListBox(b: SBox): b is SListBox {
    return b.kind === "ListBox";
}

