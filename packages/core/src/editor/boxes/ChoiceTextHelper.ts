export class ChoiceTextHelper {
    $text: string = "";

    getText(): string {
        return this.$text;
    }
    setText(v: string): void {
        this.$text = v;
    }
}
