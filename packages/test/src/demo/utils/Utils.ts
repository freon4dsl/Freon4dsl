import { PiElement, PiElementReference } from "@projectit/core";

export function printModel1(element: PiElement): string {
    return JSON.stringify(element, skipReferences, "  " )
}

const ownerprops = ["$$owner", "$$propertyName", "$$propertyIndex", "$id"];
function skipReferences(key: string, value: Object) {
    if (ownerprops.includes(key)) {
        return undefined;
    } else if( value instanceof PiElementReference) {
        return "REF => " + value.name;
    }else {
        return value;
    }
}
