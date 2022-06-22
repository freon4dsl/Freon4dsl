import { PiElement } from "..";
import { PiParseLocation } from "../reader";
import { MobxModelElementImpl } from "./decorators/DecoratedModelElement";

/**
 * An abstract implementation of a decorated PiElement.
 */
export abstract class PiElementBaseImpl extends MobxModelElementImpl implements PiElement {
    parse_location: PiParseLocation;

    copy(): PiElement {
        throw new Error("Method should be implemented by subclasses of PiElementBaseImpl.");
    }

    match(toBeMatched: Partial<PiElement>): boolean {
        throw new Error("Method should be implemented by subclasses of PiElementBaseImpl.");
    }

    piId(): string {
        throw new Error("Method should be implemented by subclasses of PiElementBaseImpl.");
    }

    piIsBinaryExpression(): boolean {
        throw new Error("Method should be implemented by subclasses of PiElementBaseImpl.");
    }

    piIsExpression(): boolean {
        throw new Error("Method should be implemented by subclasses of PiElementBaseImpl.");
    }

    piIsModel(): boolean {
        throw new Error("Method should be implemented by subclasses of PiElementBaseImpl.");
    }

    piIsUnit(): boolean {
        throw new Error("Method should be implemented by subclasses of PiElementBaseImpl.");
    }

    piLanguageConcept(): string {
        throw new Error("Method should be implemented by subclasses of PiElementBaseImpl.");
    }
}
