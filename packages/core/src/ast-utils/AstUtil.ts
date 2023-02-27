import { FreLanguage } from "../language";
import { FreBinaryExpression, FreNode, FreExpressionNode, FreModel, FreModelUnit, FreNamedNode, FreNodeReference } from "../ast";

export function isFreModel(element: FreNode): element is FreModel {
    return !!element && element.freIsModel && element.freIsModel();
}

export function isFreExpression(element: FreNode): element is FreExpressionNode {
    return !!element && element.freIsExpression && element.freIsExpression();
}

export function isFreBinaryExpression(element: FreNode): element is FreBinaryExpression {
    return !!element && element.freIsExpression && element.freIsExpression() && element.freIsBinaryExpression && element.freIsBinaryExpression();
}

export function ownerOfType(element: FreNode, typename: string, exact?: boolean): FreNode | null {
    let parent = element.freOwnerDescriptor()?.owner;
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
 * @param element
 */
export function modelUnit(element: FreNode): FreModelUnit | null {
    let current = element;
    while (!!current) {
        if (current.freIsUnit()) {
            return current as FreModelUnit;
        } else {
            current = current.freOwnerDescriptor()?.owner;
        }
    }
    // No modelunit found, element is standalone
    return null;
}

export function instanceOfExact(src: FreNode, target: string): boolean {
    return src.freLanguageConcept() === target;
}

export function instanceOfSub(src: FreNode, target: string): boolean {
    return isSubConcept(src.freLanguageConcept(), target);
}

export function isExactConcept(src, target: string): boolean {
    return src === target;
}

export function isSubConcept(src, target: string): boolean {
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
    toBeMatched: Partial<FreNodeReference<T>>[]
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
export function matchPrimitiveList(list: string[] | number[] | boolean[], toBeMatched: string[] | number[] | boolean[]): boolean {
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
