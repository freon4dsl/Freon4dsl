import { SelectBox } from "./SelectBox.js";
import { Box } from "./Box.js";
import { FreEditor } from "../FreEditor.js";
import { FreCaret } from "../util/index.js";
import type { FreModelUnit, FreNode } from "../../ast/index.js";
import { FreNodeReference } from "../../ast/index.js";
import { FreErrorSeverity } from "../../validator/index.js";
import { modelUnit } from "../../ast-utils/index.js";
import { FreLanguage } from "../../language/index.js";
import type { FreLanguageConcept } from "../../language/index.js";

export class ReferenceBox extends SelectBox {
    readonly kind: string = "ReferenceBox";
    private _myReference: FreNodeReference<any>;

    /**
     * Find the node that the reference in this box refers to and select that node in the editor.
     * @param editor
     */
    selectReferred(editor: FreEditor) {
        this.findReference();
        if (this._myReference instanceof FreNodeReference) {
            if (!!this._myReference && !!this._myReference.referred) {
                editor.selectElement(this._myReference.referred, this.propertyName, this.propertyIndex, FreCaret.RIGHT_MOST);
            } else {
                editor.setUserMessage("Cannot find a reference to '" + this._myReference.pathname.toString() + "'.", FreErrorSeverity.Error);
            }
        } else {
            console.error("Not a FreNodeReference: " + this._myReference)
        }
    }

    /**
     * Find the node that the reference in this box refers to and check whether we are able to select that node in the editor.
     */
    isSelectAble(): boolean {
        this.findReference();
        return this.isReferredInSameUnit() && !this.isLimitedRef();
    }

    /**
     * Based on the node, propertyName and propertyIndex of this box, the internal variable _myReference is set.
     * @private
     */
    private findReference() {
        if (this.propertyIndex !== null && this.propertyIndex !== undefined && this.propertyIndex >= 0) {
            // console.log('Setting this._myReference to ' + this.node.freLanguageConcept() + "[" + this.propertyName + "][" + this.propertyIndex + "]")
            this._myReference = this.node[this.propertyName][this.propertyIndex];
        } else {
            // console.log('Setting this._myReference to ' + this.node.freLanguageConcept() + "[" + this.propertyName + "]")
            this._myReference = this.node[this.propertyName];
        }
    }

    /**
     * Returns true if the node that the reference in this box refers to is in the same unit as the reference itself.
     * @private
     */
    private isReferredInSameUnit(): boolean {
        if (!!this._myReference) {
            // find the unit where the reference resides
            let myUnit: FreModelUnit = modelUnit(this._myReference?.freOwnerDescriptor().owner);

            // find the unit where node resides
            let node: FreNode = this._myReference.referred;
            let nodeUnit: FreModelUnit;
            if (!!node) {
                nodeUnit = modelUnit(node);
            }
            // check whether both units are the same
            if (!!myUnit && !!nodeUnit && myUnit === nodeUnit) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns true if the type of the node that the reference in this box refers to is a Limited concept.
     * @private
     */
    private isLimitedRef(): boolean {
        if (!!this._myReference) {
            const myRefType: FreLanguageConcept = FreLanguage.getInstance().concept(this._myReference.typeName);
            if (!!myRefType && myRefType.isLimited) {
                return true;
            }
        }
        return false;
    }
}

export function isReferenceBox(b: Box): b is ReferenceBox {
    return b?.kind === "ReferenceBox"; // b instanceof ReferenceBox;
}

