import { PiNamedElement, PiElementReference } from "../ast";

/**
 * matchReferenceList implements the match functionality on a list of PiElementReferences.
 */
export function matchReferenceList<T extends PiNamedElement>(
    list: PiElementReference<T>[],
    toBeMatched: Partial<PiElementReference<T>>[]
): boolean {
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
