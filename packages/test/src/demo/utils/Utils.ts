import { PiElement } from "@projectit/core";
import { PiElementReference } from "../language/gen/index";

export function printModel1(element: PiElement) {
    return JSON.stringify(element, skipReferences, "  " )
}

const ownerprops = ["$$owner", "$$propertyName", "$$propertyIndex"];
function skipReferences(key: string, value: Object) {
    if (ownerprops.includes(key)) {
        return undefined;
    } else if( value instanceof PiElementReference) {
        return "REF => " + value.name;
    }else {
        return value;
    }
}
