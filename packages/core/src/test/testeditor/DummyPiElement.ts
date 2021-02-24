import { PiContainerDescriptor, PiElement } from "@projectit/core";

// Used to set a root which is not really a PiElement in tests
export class DummyPiElement implements PiElement {
    piContainer(): PiContainerDescriptor {
        return undefined;
    }

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

    piLanguageConcept(): string {
        return "";
    }

}
