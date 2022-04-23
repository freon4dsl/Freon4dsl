import { MobxModelElementImpl } from "../../language/decorators/DecoratedModelElement";
import { PiElement } from "../../model";
import { Box } from "./Box";

export class DummyBox extends Box {
    kind = "DummyBox";

    constructor(element: PiElement, role: string) {
        super(element, role);
    }
}

export class DummyElement extends MobxModelElementImpl implements PiElement {
    piId(): string {
        return "";
    }

    piIsBinaryExpression(): boolean {
        return false;
    }

    piIsExpression(): boolean {
        return false;
    }

    piIsModel(): boolean {
        return false;
    }

    piIsUnit(): boolean {
        return false;
    }

    piLanguageConcept(): string {
        return "DummyElement";
    }

}
