import { PiOwnerDescriptor } from "./PiOwnerDescriptor";
import { PiParseLocation } from "../reader";

/**
 * You can either directly implement these interfaces, or use `Module Augmentation`,
 * as described in `https://www.typescriptlang.org/docs/handbook/declaration-merging.html`.
 */
export interface PiElement {
    piId(): string;

    piLanguageConcept(): string;

    piOwner(): PiElement;

    piOwnerDescriptor(): PiOwnerDescriptor;

    piIsModel(): boolean;

    piIsUnit(): boolean;

    piIsExpression(): boolean;

    piIsUnaryExpression(): boolean;

    piIsBinaryExpression(): boolean;

    copy(): PiElement;

    match(toBeMatched: Partial<PiElement>): boolean;

    parse_location: PiParseLocation;    // if relevant, the location of this element within the source from which it is parsed`;
}
