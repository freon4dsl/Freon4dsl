import { PiContainerDescriptor } from "./PiContainerDescriptor";

/**
 * You can either directly implement these interfaces, or use `Module Augmentation`,
 * as described in `https://www.typescriptlang.org/docs/handbook/declaration-merging.html`.
 */
export interface PiElement {
    piId(): string;

    piLanguageConcept(): string;

    piContainer(): PiContainerDescriptor;

    piIsModel(): boolean;

    piIsUnit(): boolean;

    piIsExpression(): boolean;

    piIsBinaryExpression(): boolean;
}
