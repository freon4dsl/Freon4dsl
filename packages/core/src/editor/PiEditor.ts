import { isEqual } from "lodash";
import { makeObservable, observable, computed, action, runInAction } from "mobx";
import { PiEnvironment } from "../environment";

import { PiOwnerDescriptor, PiElement } from "../ast";
import { wait } from "../util";
import { PiLogger } from "../logging";
import { PiAction } from "./actions";
import {
    PiProjection,
    isAliasBox,
    isSelectBox,
    isTextBox,
    Box,
    PiCompositeActions
} from "./internal";
import { PiCaret } from "./PiCaret";

const LOGGER = new PiLogger("PiEditor").mute();

export class PiEditor {
    readonly actions?: PiCompositeActions;  // All actions with which this editor is created.
    readonly projection: PiProjection;      // The root projection with which this editor is created.
    new_pi_actions: PiAction[] = [];        // List of PiActions composed of all the actions in 'actions'
    theme: string = "light";                // The current theme.
    environment: PiEnvironment;             // Needed to find reference shortcuts in the Alias box.
    scrollX: number = 0;                    // The amount of scrolling horizontally, to find the element above and under.
    scrollY: number = 0;                    // The amount of scrolling vertically, to find the element above and under.

    private $rootBox: Box | null = null;        // The 'top' box in the box hierarchy.
    private $selectedBox: Box | null = null;    // The currently selected box.
    // private $selectedRole: string = null;       // the currenly selected role.

    constructor(projection: PiProjection, actions?: PiCompositeActions) {
        this.projection = projection;
        this.actions = actions;
        if (!!actions) {
            actions.customActions.forEach(ca => this.new_pi_actions.push(ca));
            actions.binaryExpressionActions.forEach(ca => this.new_pi_actions.push(ca));
        }

        // TODO question: why the '"$rootBox" | "$selectedRole" | "$selectedBox"'?
        makeObservable<PiEditor, "$rootBox" | "$selectedBox">(this, {
            $rootBox: observable,
            $selectedBox: observable,
            // $selectedRole: observable,
            theme: observable,
            selectedBox: computed,
            deleteBox: action,
            rootBox: computed
        });
        // TODO question: why both $selectedBox: observable, and selectedBox: computed?
    }

    // Getters and Setters

    set selectedBox(box: Box) {
        LOGGER.log("selectedBox:  set selected box to: " + (!!box ? box.role : "null"));
        if (isAliasBox(box)) {
            this.$selectedBox = box.textBox;
        } else {
            this.$selectedBox = box;
        }
        // if (!!box) {
        //     this.$selectedRole = this.$selectedBox.role;
        // }
    }

    get selectedBox() {
        return this.$selectedBox;
    }

    set rootElement(exp: PiElement) {
        runInAction(() => {
            this.$rootBox = this.projection.getBox(exp);
        });
    }

    get rootElement(): PiElement {
        return this.$rootBox.element;
    }

    get selectedElement(): PiElement {
        return this.$selectedBox.element;
    }

    get rootBox(): Box { // used from ProjectItComponent only
        // TODO simplify!!
        // LOGGER.log("RECALCULATING ROOT [" + this.rootElement + "]");
        // const result = this.projection.getBox(this.rootElement);
        // LOGGER.log("Root box id is " + result.$id);
        // this.$rootBox = result;
        // LOGGER.log("Root box id is set now");
        // return result;
        return this.projection.getBox(this.rootElement);
    }

    /**
     * Selects the box associated with 'element'.
     * This setter for '$selectedElement' takes into account the box-role.
     * @param element
     * @param role
     */
    selectElement(element: PiElement, role?: string) {
        LOGGER.log("selectElement " + element?.piLanguageConcept());
        if (element === null || element === undefined) {
            console.error("PiEditor.selectElement is null !");
            return;
        }
        // this.$selectedRole = role;
        // LOGGER.log("selectElement: selectElement " + (!!element && element) + " Role: " + role);
        const box = this.$rootBox.findBox(element.piId(), role);
        // LOGGER.log("selectElement: selectElement found box " + box?.kind);
        if (!!box) {
            this.selectBoxNew(box);
        // } else {
        //     if (!!role) {
        //         // TODO Does not work ok => optional role is already handled by findBox few lines earlier
        //         LOGGER.log("seletElement: Trying without role, element id is " + element.piId());
        //         const box = this.$rootBox.findBox(element.piId());
        //         LOGGER.log("selectElement: selectElement found main box " + box?.kind);
        //     }
        }
    }

    // A series of Setters for $SelectedBox

    /**
     * Selects the parent of the currently selected box.
     */
    selectParentBox() {
        LOGGER.log("==> SelectParent of " + this.selectedBox.role + this.selectedBox?.parent.kind);
        let parent = this.selectedBox.parent;
        if (isAliasBox(parent) || isSelectBox(parent)) {
            // Coming from (hidden) textbox in Select/Alias box
            parent = parent.parent;
        }
        if (!!parent) {
            if (parent.selectable) {
                this.selectBoxNew(parent);
            } else {
                this.selectBoxNew(parent);
                this.selectParentBox();
            }
        }
    }

    /**
     * Selects the first child of the currently selected box
     */
    selectFirstLeafChildBox() {
        const first: Box = this.selectedBox.firstLeaf;
        if (!!first) {
            this.selectBoxNew(first, PiCaret.LEFT_MOST);
        }
    }

    selectNextLeaf() {
        const next = this.selectedBox.nextLeafRight;
        LOGGER.log("!!!!!!! Select next leaf is box " + next?.role);
        if (!!next) {
            this.selectBoxNew(next, PiCaret.LEFT_MOST);
        }
    }

    selectPreviousLeaf() {
        const previous = this.selectedBox.nextLeafLeft;
        if (!!previous) {
            this.selectBoxNew(previous, PiCaret.RIGHT_MOST);
        }
    }

    selectFirstEditableChildBox() {
        const first: Box = this.selectedBox.firstEditableChild;
        LOGGER.log("selectFirstEditableChildBox: " + first.kind + " elem: " + first.element + "  role " + first.role);
        if (!!first) {
            LOGGER.info("selectFirstEditableChildBox: first found with role " + first.role);
            this.selectBoxNew(first);
        }
    }

    /**
     * Selects ... todo
     * @param box
     * @param caretPosition
     */
    private selectBoxNew(box: Box, caretPosition?: PiCaret) {
        LOGGER.log("SelectBoxNEW: " + (box ? box.role : box) + "  caret " + caretPosition?.position);
        this.selectBox(this.$rootBox.findBox(box.element.piId(), box.role), caretPosition);
    }

    private selectBox(box: Box | null, caretPosition?: PiCaret) {
        if (box === null || box === undefined) {
            console.error("PiEditor.selectBox is null !");
            return;
        }
        LOGGER.log("selectBox: " + (!!box ? box.role : box) + " caret " + caretPosition?.position);
        if (box === this.selectedBox) {
            LOGGER.info("box already selected");
            return;
        }
        if (isAliasBox(box)) {
            this.selectedBox = box.textBox; // TODO why?
        } else {
            this.selectedBox = box;
        }
        LOGGER.log("selectBox: select box " + this.selectedBox.role);
        if (isTextBox(box) || isAliasBox(box) || isSelectBox(box)) {
            if (!!caretPosition) {
                LOGGER.log("caret position is " + caretPosition.position);
                box.setCaret(caretPosition);
            } else {
                LOGGER.log("caret position is empty");
                box.setCaret(PiCaret.RIGHT_MOST);
            }
        }
        LOGGER.log("setting focus on box " + this.selectedBox.role);
        // box.setFocus();
    }

    deleteBox(box: Box) {
        LOGGER.log("deleteBox");
        const exp: PiElement = box.element;
        const ownerDescriptor: PiOwnerDescriptor = exp.piOwnerDescriptor();
        // if (isPiExpression(exp)) {
        //     const newExp = this.getPlaceHolderExpression();
        //     PiUtils.replaceExpression(exp, newExp, this);
        //     await this.selectElement(newExp);
        // } else {
        if (ownerDescriptor !== null) {
            LOGGER.log("remove from parent splice " + [ownerDescriptor.propertyIndex] + ", 1");
            const propertyIndex = ownerDescriptor.propertyIndex;
            const parentElement = ownerDescriptor.owner;
            if (propertyIndex !== undefined) {
                let arrayProperty = (ownerDescriptor.owner as any)[ownerDescriptor.propertyName] as any;
                arrayProperty.splice(propertyIndex, 1);
                let length = arrayProperty.length;
                if (length === 0) {
                    // TODO Maybe we should select the element (or leaf) just before the list.
                    this.selectElement(parentElement, `${ownerDescriptor.owner.piLanguageConcept()}-${ownerDescriptor.propertyName}`);
                } else if (length <= propertyIndex) {
                    this.selectElement(arrayProperty[propertyIndex - 1]);
                } else {
                    this.selectElement(arrayProperty[propertyIndex]);
                }
            } else {
                ownerDescriptor.owner[ownerDescriptor.propertyName] = null;
                // TODO The rolename is identical to the one generated in Roles.ts,  should not be copied here
                this.selectElement(ownerDescriptor.owner,
                    (ownerDescriptor.owner.piIsBinaryExpression() ? `PiBinaryExpression-${ownerDescriptor.propertyName}` : `${ownerDescriptor.owner.piLanguageConcept()}-${ownerDescriptor.propertyName}`));
            }
        }
        // }
    }

    /**
     * Returns the box that is visually above `box`.
     * @param box
     */
    boxAbove(box: Box): Box {
        wait(0); // TODO why the wait?
        const x = box.actualX + this.scrollX;
        const y = box.actualY + this.scrollY;
        let result: Box = box.nextLeafLeft;
        let tmpResult = result;
        LOGGER.log("boxAbove " + box.role + ": " + Math.round(x) + ", " + Math.round(y) + " text: " +
            (isTextBox(box) ? box.getText() : "NotTextBox"));
        while (result !== null) {
            LOGGER.log("previous : " + result.role + "  " + Math.round(result.actualX + this.scrollX) + ", " + Math.round(result.actualY + this.scrollY));
            if (this.isOnPreviousLine(tmpResult, result) && this.isOnPreviousLine(box, tmpResult)) {
                return tmpResult;
            }
            if (this.isOnPreviousLine(box, result)) {
                if (result.actualX <= x) {
                    return result;
                }
            }
            const next = result.nextLeafLeft;
            tmpResult = result;
            result = next;
        }
        return result;
    }

    /**
     * Returns the box that is visually below `box`.
     * @param box
     */
    boxBelow(box: Box): Box {
        const x = box.actualX + this.scrollX;
        const y = box.actualY + this.scrollX;
        let result: Box = box.nextLeafRight;
        let tmpResult = result;
        LOGGER.log("boxBelow " + box.role + ": " + Math.round(x) + ", " + Math.round(y) + " text: " +
            (isTextBox(box) ? box.getText() : "NotTextBox"));
        while (result !== null) {
            LOGGER.log("next : " + result.role + "  " + Math.round(result.actualX + this.scrollX) + ", " + Math.round(result.actualY + this.scrollY));
            if (this.isOnNextLine(tmpResult, result) && this.isOnNextLine(box, tmpResult)) {
                LOGGER.log("Found box below 1 [" + (!!tmpResult ? tmpResult.role : "null") + "]");
                return tmpResult;
            }
            if (this.isOnNextLine(box, result)) {
                if (result.actualX + this.scrollX + result.actualWidth >= x) {
                    LOGGER.log("Found box below 2 [" + (!!result ? result.role : "null") + "]");
                    return result;
                }
            }
            const next = result.nextLeafRight;
            tmpResult = result;
            result = next;
        }
        LOGGER.log("Found box below 3 [ null ]");
        return result;
    }

    addOrReplaceAction(piCustomAction: PiAction) { // used by TableUtil
        const alreadyThere = this.new_pi_actions.findIndex(action => {
            return isEqual(action.trigger, piCustomAction.trigger) && isEqual(action.activeInBoxRoles, piCustomAction.activeInBoxRoles);
        });
        if (alreadyThere !== -1) { // found it
            this.new_pi_actions.splice(alreadyThere, 1, piCustomAction);
        } else {
            this.new_pi_actions.splice(0, 0, piCustomAction);
        }
    }

    private isOnPreviousLine(ref: Box, other: Box): boolean {
        const margin = 5;
        return other.actualY + margin < ref.actualY;
    }

    private isOnNextLine(ref: Box, other: Box): boolean {
        return this.isOnPreviousLine(other, ref);
    }
}
