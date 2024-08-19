import { TextBox } from "./TextBox.js";

export class ChoiceTextHelper {
    box: TextBox;
    $text: string = "";

    getText(): string {
        return this.$text;
    }
    setText(v: string): void {
        this.$text = v;
        this.box?.isDirty();
    }
}
