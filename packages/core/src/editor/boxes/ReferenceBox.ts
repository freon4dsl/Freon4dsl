import {SelectBox} from "./SelectBox";
import {Box} from "./Box";
import {FreEditor} from "../FreEditor";
import {FreCaret, MenuItem} from "../util";
import {FreNode, FreNodeReference} from "../../ast";
import {FreErrorSeverity} from "../../validator";

export class ReferenceBox extends SelectBox {
    readonly kind: string = "ReferenceBox";

    contextMenuOptions(): MenuItem[] {
        let items: MenuItem[] = [];
        // first create the items that depend upon the conceptName
        let goToReferred: MenuItem = new MenuItem(
            "Go to definition",
            "",
            // @ts-ignore
            (parentNode: FreNode, index: number, editor: FreEditor) => {
                let myReference: FreNodeReference<any> = parentNode[this.propertyName];
                if (myReference instanceof FreNodeReference) {
                    console.log("Found FreNodeReference: " + myReference.typeName)
                    if (!!myReference && !!myReference.referred) {
                        console.log("Letting editor select " + myReference.name + ", " + this.propertyName)
                        editor.selectElement(myReference.referred, this.propertyName, this.propertyIndex, FreCaret.RIGHT_MOST);
                    } else {
                        editor.setUserMessage("Cannot find a reference to '" + myReference.pathname.toString() + "'.", FreErrorSeverity.Error);
                    }
                } else {
                    console.log("Not a FreNodeReference: " + parentNode.constructor.name)
                }
            },
        );
        items.push(goToReferred);
        return items;
    }
}

export function isReferenceBox(b: Box): b is ReferenceBox {
    return b?.kind === "ReferenceBox"; // b instanceof ReferenceBox;
}
