import { FreLanguage } from "../language";
import {
    FreBinaryExpression,
    FreNode,
    FreExpressionNode,
    FreModel,
    FreModelUnit,
    FreNamedNode,
    FreNodeReference,
} from "../ast";

export function isFreModel(node: FreNode): node is FreModel {
    return !!node && node.freIsModel && node.freIsModel();
}

export function isFreExpression(node: FreNode): node is FreExpressionNode {
    return !!node && node.freIsExpression && node.freIsExpression();
}

export function isFreBinaryExpression(node: FreNode): node is FreBinaryExpression {
    return (
        !!node &&
        node.freIsExpression &&
        node.freIsExpression() &&
        node.freIsBinaryExpression &&
        node.freIsBinaryExpression()
    );
}

export function ownerOfType(node: FreNode, typename: string, exact?: boolean): FreNode | null {
    let parent = node.freOwnerDescriptor()?.owner;
    while (!!parent) {
        if (exact ? instanceOfExact(parent, typename) : instanceOfSub(parent, typename)) {
            return parent;
        } else {
            parent = parent.freOwnerDescriptor()?.owner;
        }
    }
    return null;
}

/**
 * Returns the modelunit that owns this `element'
 * @param node
 */
export function modelUnit(node: FreNode): FreModelUnit | null {
    let current = node;
    while (!!current) {
        if (current.freIsUnit()) {
            return current as FreModelUnit;
        } else {
            current = current.freOwnerDescriptor()?.owner;
        }
    }
    // No modelunit found, node is standalone
    return null;
}

export function instanceOfExact(src: FreNode, target: string): boolean {
    return src.freLanguageConcept() === target;
}

export function instanceOfSub(src: FreNode, target: string): boolean {
    return isSubConcept(src.freLanguageConcept(), target);
}

export function isExactConcept(src: string, target: string): boolean {
    return src === target;
}

export function isSubConcept(src: string, target: string): boolean {
    return src === target || FreLanguage.getInstance().classifier(target).subConceptNames.includes(src);
}

/**
 * Returns true if all elements of 'toBeMatched' occur in 'list'.
 * @param list
 * @param toBeMatched
 */
export function matchElementList(list: FreNode[], toBeMatched: Partial<FreNode>[]): boolean {
    let foundMatch: boolean = true;
    for (const theirs of toBeMatched) {
        let xx: boolean = false;
        for (const mine of list) {
            if (mine.match(theirs)) {
                xx = true;
                break;
            }
        }
        foundMatch = foundMatch && xx;
        if (!foundMatch) {
            return false;
        }
    }
    return foundMatch;
}

/**
 * matchReferenceList implements the match functionality on a list of FreElementReferences.
 */
export function matchReferenceList<T extends FreNamedNode>(
    list: FreNodeReference<T>[],
    toBeMatched: Partial<FreNodeReference<T>>[],
): boolean {
    // This code is the same as in matchElementList, but types do not conform,
    // therefore this code is duplicated. // todo improve
    let foundMatch: boolean = true;
    for (const theirs of toBeMatched) {
        let xx: boolean = false;
        for (const mine of list) {
            if (mine.match(theirs)) {
                xx = true;
                break;
            }
        }
        foundMatch = foundMatch && xx;
        if (!foundMatch) {
            return false;
        }
    }
    return foundMatch;
}

/**
 * Returns true if all elements of 'toBeMatched' occur in 'list'.
 * @param list
 * @param toBeMatched
 */
export function matchPrimitiveList(
    list: string[] | number[] | boolean[],
    toBeMatched: string[] | number[] | boolean[],
): boolean {
    let foundMatch: boolean = true;
    for (const theirs of toBeMatched) {
        let xx: boolean = false;
        for (const mine of list) {
            if (mine === theirs) {
                xx = true;
                break;
            }
        }
        foundMatch = foundMatch && xx;
        if (!foundMatch) {
            return false;
        }
    }
    return foundMatch;
}
