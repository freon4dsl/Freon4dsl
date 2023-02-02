import { FreNode, FreNodeReference } from "@projectit/core";

export function printModel1(element: FreNode): string {
    return JSON.stringify(element, skipReferences, "  " )
}

const ownerprops = ["$$owner", "$$propertyName", "$$propertyIndex", "$id"];
function skipReferences(key: string, value: Object) {
    if (ownerprops.includes(key)) {
        return undefined;
    } else if( value instanceof FreNodeReference) {
        return "REF => " + value.name;
    }else {
        return value;
    }
}
