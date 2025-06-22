import { FreLanguage } from "../language/index.js";
import {
    FreBinaryExpression,
    FreNode,
    FreExpressionNode,
    FreModel,
    FreModelUnit,
    FreNamedNode,
    FreNodeReference,
} from "../ast/index.js";
import { isNullOrUndefined } from "../util/index.js";

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
 * matchReferenceList implements the match functionality on a list of FreNodeReferences.
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

export function astToString(element: FreNode): string {
    return JSON.stringify(element, skipReferences, "  " )
}

const ownerprops: string[] = ["$$owner", "$$propertyName", "$$propertyIndex"];

function skipReferences(key: string, value: Object) {
    if (ownerprops.includes(key)) {
        return undefined;
    } else if( value instanceof FreNodeReference) {
        return "REF => " + value.name;
    }else {
        return value;
    }
}

let INDENT = "    "

export function ast2string(node: FreNode, indent: string): string {
    if (isNullOrUndefined(node)) {
        return "NNN NODE IS NULL or UNDEFINED"
    } else {
        // console.log(`NNN node '${node.freId()}'`)
    }
    INDENT = indent
    const result: string[] = []
    ast2StringPrivate(node, result, INDENT)
    return result.join("\n")
}

export function ast2StringPrivate(node: FreNode, result: string[], indent: string): void {
    if (isNullOrUndefined(node)) {
        return
    } else {
        // console.log(`1 node '${node.freId}'`)
        // console.log(`2 node '${node.freId()}'`)
    }
    const classifier = FreLanguage.getInstance().classifier(node.freLanguageConcept())
    const nameProperty = classifier.properties.get("name")
    if (nameProperty !== undefined) {
        result.push(`${indent}${classifier.typeName} ${node["name"]}`)
    } else {
        result.push(`${indent}${classifier.typeName}}`)
    }
    for(const prop of Array.from(classifier.properties.values())) {
        switch (prop.propertyKind) {
            case "primitive": {
                result.push(`${indent}${indent}${prop.name}: ${node[prop.name]}`)
                break
            }
            case "reference": {
                if (prop.isList) {
                    result.push(`${indent}${indent}${prop.name}: reference `)
                    for(const ref of node[prop.name]) {
                        result.push(`${indent}${indent}${indent} ref ${(ref as FreNodeReference<any>).name} / ${ref.pathname}`)
                    }
                } else {
                    result.push(`${indent}${indent}${prop.name}: reference ${(node[prop.name] as FreNodeReference<any>)?.name} / ${(node[prop.name] as FreNodeReference<any>)?.pathname}`)
                }
                break
            }
            case "part": {
                result.push(`${indent}${indent}Part ${prop.name}`)
                if (prop.isList) {
                    for(const part of node[prop.name]) {
                        ast2StringPrivate(part, result, indent + INDENT + INDENT)
                    }
                } else {
                    ast2StringPrivate(node[prop.name], result, indent  + INDENT + INDENT)
                }
                break
            }
        }
    }
}
