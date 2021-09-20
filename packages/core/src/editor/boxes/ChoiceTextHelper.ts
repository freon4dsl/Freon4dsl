import { makeObservable, observable, action } from "mobx";
import { MobxModelElementImpl } from "../../language/decorators/DecoratedModelElement";

export class ChoiceTextHelper extends MobxModelElementImpl {
    $text: string = "";

    constructor() {
        super();
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
