import { makeObservable, observable, action } from "mobx";

export class ChoiceTextHelper  {
    $text: string = "";

    constructor() {
        makeObservable(this, {
            $text: observable,
            setText: action
        })
    }

    getText(): string  {
        return this.$text;
    }
    setText(v: string): void {
        this.$text = v;
    }


}
