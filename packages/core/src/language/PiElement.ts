import { PiOwnerDescriptor } from "./PiOwnerDescriptor";

/**
 * You can either directly implement these interfaces, or use `Module Augmentation`,
 * as described in `https://www.typescriptlang.org/docs/handbook/declaration-merging.html`.
 */
// tag::element-interface[]
export interface PiElement {
    piId(): string;

    piLanguageConcept(): string;

    piOwnerDescriptor(): PiOwnerDescriptor;

    piIsModel(): boolean;

    piIsUnit(): boolean;

    piIsExpression(): boolean;

    piIsBinaryExpression(): boolean;
}
// end::element-interface[]
