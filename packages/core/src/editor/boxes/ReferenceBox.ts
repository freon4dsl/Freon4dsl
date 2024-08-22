import {SelectBox} from "./SelectBox";
import {Box} from "./Box";
import {FreEditor} from "../FreEditor";
import {FreCaret} from "../util";
import {FreModelUnit, FreNode, FreNodeReference} from "../../ast";
import {FreErrorSeverity} from "../../validator";

export class ReferenceBox extends SelectBox {
    readonly kind: string = "ReferenceBox";
    private _myReference: FreNodeReference<any>;

    selectReferred(editor: FreEditor) {
        this.findReference();
        if (this._myReference instanceof FreNodeReference) {
            if (!!this._myReference && !!this._myReference.referred) {
                editor.selectElement(this._myReference.referred, this.propertyName, this.propertyIndex, FreCaret.RIGHT_MOST);
            } else {
                editor.setUserMessage("Cannot find a reference to '" + this._myReference.pathname.toString() + "'.", FreErrorSeverity.Error);
            }
        } else {
            console.log("Not a FreNodeReference: " + this._myReference)
        }
    }

    private findReference() {
        if (!this._myReference) {
            if (!!this.propertyIndex) {
                console.log('Setting this._myReference to ' + this.node.freLanguageConcept() + "[" + this.propertyName + "][" + this.propertyIndex + "]")
                this._myReference = this.node[this.propertyName][this.propertyIndex];
            } else {
                console.log('Setting this._myReference to ' + this.node.freLanguageConcept() + "[" + this.propertyName + "]")
                this._myReference = this.node[this.propertyName];
            }
        }
    }

    isReferredInSameUnit(): boolean {
        this.findReference();
        if (!!this._myReference) {
            // find the unit where the reference resides
            let myUnit: FreModelUnit = this.findUnit(this._myReference?.freOwnerDescriptor().owner);

            let node: FreNode = this._myReference.referred;
            // find the unit where node resides
            let nodeUnit: FreModelUnit;
            if (!!node) {
                nodeUnit = this.findUnit(node);
            }
            if (!!myUnit && !!nodeUnit && myUnit === nodeUnit) {
                return true;
            }
        }
        return false;
    }

    findUnit(xx: FreNode): FreModelUnit {
        if (!!xx) {
            if (xx.freIsUnit()) {
                return xx as FreModelUnit;
            } else {
                return this.findUnit(xx.freOwnerDescriptor()?.owner)
            }
        } else {
            return undefined;
        }
    }
}

export function isReferenceBox(b: Box): b is ReferenceBox {
    return b?.kind === "ReferenceBox"; // b instanceof ReferenceBox;
}
