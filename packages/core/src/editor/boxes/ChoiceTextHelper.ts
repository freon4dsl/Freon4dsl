export class ChoiceTextHelper  {
    $text: string = "";

    constructor() {
    }

    getText(): string  {
        return this.$text;
    }
    setText(v: string): void {
        this.$text = v;
    }


}
