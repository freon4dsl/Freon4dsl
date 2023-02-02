import { FreNamedNode, FreNodeReference } from "../ast";

/**
 * matchReferenceList implements the match functionality on a list of FreElementReferences.
 */
export function matchReferenceList<T extends FreNamedNode>(
    list: FreNodeReference<T>[],
    toBeMatched: Partial<FreNodeReference<T>>[]
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
