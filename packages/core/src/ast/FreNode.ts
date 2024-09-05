import { FreOwnerDescriptor } from "./FreOwnerDescriptor";
import { FreParseLocation } from "../reader";

/**
 * You can either directly implement these interfaces, or use `Module Augmentation`,
 * as described in `https://www.typescriptlang.org/docs/handbook/declaration-merging.html`.
 */
export interface FreNode {
    freId(): string;

    freLanguageConcept(): string;

    freOwner(): FreNode | undefined;

    freOwnerDescriptor(): FreOwnerDescriptor;

    freIsModel(): boolean;

    freIsUnit(): boolean;

    freIsExpression(): boolean;

    freIsBinaryExpression(): boolean;

    copy(): FreNode;

    match(toBeMatched: Partial<FreNode>): boolean;

    parseLocation?: FreParseLocation; // if relevant, the location of this node within the source from which it is parsed
}
