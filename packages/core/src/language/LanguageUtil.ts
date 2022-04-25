import { Language } from "../storage/index";
import { PiBinaryExpression } from "./PiBinaryExpression";
import { PiElement } from "./PiElement";
import { PiExpression } from "./PiExpression";
import { PiModel } from "./PiModel";
import { PiModelUnit } from "./PiModelUnit";

export function isPiModel(element: PiElement): element is PiModel {
    return !!element && element.piIsModel && element.piIsModel();
}

export function isPiExpression(element: PiElement): element is PiExpression {
    return !!element && element.piIsExpression && element.piIsExpression();
}

export function isPiBinaryExpression(element: PiElement): element is PiBinaryExpression {
    return !!element && element.piIsExpression && element.piIsExpression() && element.piIsBinaryExpression && element.piIsBinaryExpression();
}

export function ownerOfType(element: PiElement, typename: string, exact?: boolean): PiElement {
    let parent = element.piOwnerDescriptor()?.owner;
    while (!!parent) {
        if (exact ? instanceOfExact(parent, typename) : instanceOfSub(parent, typename)) {
            return parent;
        } else {
            parent = parent.piOwnerDescriptor()?.owner;
        }
    }
    return null;
}

/**
 * Returns the modelunit that owns this `element'
 * @param element
 */
export function modelUnit(element: PiElement): PiModelUnit {
    let current = element;
    while (!!current) {
        if (current.piIsUnit()) {
            return current as PiModelUnit;
        } else {
            current = current.piOwnerDescriptor()?.owner;
        }
    }
    // No modelunit found, element is standalone
    return null;
}

export function instanceOfExact(src: PiElement, target: string): boolean {
    return src.piLanguageConcept() === target;
}

export function instanceOfSub(src: PiElement, target: string): boolean {
    return isSubConcept(src.piLanguageConcept(), target);
}

export function isExactConcept(src, target: string): boolean {
    return src === target;
}

export function isSubConcept(src, target: string): boolean {
    return src === target || Language.getInstance().classifier(target).subConceptNames.includes(src);
}

export function matchElementList(list: PiElement[], toBeMatched: Partial<PiElement>[]): boolean {
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
