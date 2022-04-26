import { PiOwnerDescriptor } from "./PiOwnerDescriptor";

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

    piIsBinaryExpression(): boolean;

    match(toBeMatched: Partial<PiElement>): boolean;
}