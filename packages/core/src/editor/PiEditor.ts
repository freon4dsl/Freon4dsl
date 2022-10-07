import { isEqual } from "lodash";
import { makeObservable, observable, computed, action, trace, runInAction } from "mobx";
import { PiEnvironment } from "../environment/PiEnvironment";
import { PiOwnerDescriptor, PiElement } from "../ast";
import { PiLogger } from "../logging";
import { PiAction } from "./actions/index";
import {
    PiProjection,
    isActionBox,
    isSelectBox,
    isTextBox,
    Box,
    PiCombinedActions, PiCaret, wait
} from "./internal";

const LOGGER = new PiLogger("PiEditor"); //.mute();

export class PiEditor {
    readonly actions?: PiCombinedActions;   // All actions with which this editor is created.
    readonly projection: PiProjection;      // The root projection with which this editor is created.
    newPiActions: PiAction[] = [];          // List of PiActions composed of all the actions in 'actions'
    theme: string = "light";                // The current theme.
    environment: PiEnvironment;             // The generated language environment, needed to find reference shortcuts in the Alias box.
    scrollX: number = 0;                    // The amount of scrolling horizontally, to find the element above and under.
    scrollY: number = 0;                    // The amount of scrolling vertically, to find the element above and under.

    copiedElement: PiElement;               // The element that is currently handled in a cut/copy-paste situation.

    private _rootElement: PiElement = null;     // The model element to be shown in this editor.
    private _rootBox: Box | null = null;        // The box that is defined for the _rootElement. Note that it is a 'slave' to _rootElement.
    private _selectedElement: PiElement = null; // The model element that is currently selected in the editor.
    private _selectedBox: Box | null = null;    // The box defined for _selectedElement. Note that it is a 'slave' to _selectedElement.
    private _selectedPosition: PiCaret = PiCaret.UNSPECIFIED;   // The caret position within the _selectedBox.
    private _selectedRole: string = null;       // TODO not really used, remove?
    // TODO question: NOSELECT is not used, remove?
    private NOSELECT: Boolean = false;          // Do not accept "select" actions, used e.g. when an undo is going to come.

    /**
     * The constructor makes a number of private properties observable.
     * @param projection
     * @param environment
     * @param actions
     */
    constructor(projection: PiProjection, environment: PiEnvironment, actions?: PiCombinedActions) {
        this.actions = actions;
        this.projection = projection;
        this.environment = environment;
        this.initializeAliases(actions);
        // TODO rethink whether selectedBox should be observable
        makeObservable<PiEditor, "_rootBox" | "_rootElement" | "_selectedElement" | "_selectedBox" | "_selectedRole">(this, {
            theme: observable,
            _rootElement: observable,
            _rootBox: observable,
            _selectedElement: observable,
            _selectedBox: observable,
            _selectedRole: observable,
            selectedBox: computed,
            deleteBox: action
        });
    }

    // Static helper methods

    /**
     * Returns true when 'other' is on the line above 'ref'.
     * @param ref
     * @param other
     * @private
     */
    private static isOnPreviousLine(ref: Box, other: Box): boolean {
        const margin = 5;
        return other.actualY + margin < ref.actualY;
    }

    /**
     * Returns true when 'other' is on the line below 'ref'.
     * @param ref
     * @param other
     * @private
     */
    private static isOnNextLine(ref: Box, other: Box): boolean {
        return this.isOnPreviousLine(other, ref);
    }

    // Getters and Setters

    /**
     * Sets a new root element in this editor, calculates the projection for this element,
     * which returns the root box.
     * @param exp
     */
    set rootElement(exp: PiElement) {
        runInAction(() => {
                this._rootElement = exp;
                this._rootBox = this.projection.getBox(this._rootElement);
            }
        );
    }

    get rootElement(): PiElement {
        return this._rootElement;
    }

    get rootBox(): Box {
        // runInAction( () =>
            // TODO runInAction to avoid mobx warning: changing (observed) observable values without using an action is not allowed.
            this._rootBox = this.projection.getBox(this.rootElement)
        // );
        return this._rootBox;
    }

    /**
     * Sets the selected box programmatically, and adjusts the selected element as well.
     * @param box
     */
    set selectedBox(box: Box) { // TODO question how does this method relate to the other setters for _selectedBox? The check on ActionBox is also there.
        LOGGER.log("selectedBox:  set selected box to: " + (!!box ? box.role : "null") + "  NOSELECT [" + this.NOSELECT + "]");
        if (this.NOSELECT) {
            return;
        }

        if (!!box && isActionBox(box)) {
            this._selectedBox = box.textBox;
        } else {
            this._selectedBox = box;
        }
        if (!!this._selectedBox) {
            this._selectedElement = this._selectedBox.element;
            this._selectedRole = this._selectedBox.role;
        }
    }

    get selectedBox(): Box {
        return this._selectedBox;
    }

    get selectedItem(): PiElement {
        return this._selectedElement;
    }

    /**
     * The only setter for _selectedElement, used to programmatically select an element.
     * @param element
     * @param role
     * @param caretPosition
     */
    selectElement(element: PiElement, role?: string, caretPosition?: PiCaret) {
        LOGGER.log("selectElement " + element?.piLanguageConcept());
        if (this.NOSELECT) {
            return;
        }
        if (element === null || element === undefined) {
            console.error("PiEditor.selectElement is null !");
            return;
        }
        this._selectedElement = element;
        this._selectedRole = role;
        this._selectedPosition = caretPosition;
        const box = this._rootBox.findBox(element.piId(), role);
        // LOGGER.log("selectElement: selectElement found box " + box?.kind);
        if (!!box) {
            this.selectBoxNew(box, caretPosition);
        }
    }

    // A series of setters for _selectedBox

    // TODO this method is unused, remove?
    selectBoxByRoleAndElementId(elementId: string, role: string) {
        LOGGER.log("selectBoxByRoleAndElementId " + elementId + "  role " + role);
        if (this.NOSELECT) {
            return;
        }
        this.selectBox(this._rootBox.findBox(elementId, role));
    }

    /**
     * Sets the parent of the currently selected box to be the selected box.
     */
    selectParentBox() {
        LOGGER.log("==> SelectParent of " + this.selectedBox?.role + this.selectedBox?.parent.kind);
        let parent = this.selectedBox?.parent;
        if (!!parent && (isActionBox(parent) || isSelectBox(parent))) {
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
     * Sets the first editable/selectable child of the currently selected box to be the selected box.
     */
    selectFirstLeafChildBox() {
        const first = this.selectedBox?.firstLeaf;
        if (!!first) {
            this.selectBoxNew(first);
        }
    }

    /**
     * Sets the first editable/selectable child of the currently selected box to be the selected box.
     * TODO question: what is the diff with the previous method?
     */
    selectFirstEditableChildBox() {
        const first = this.selectedBox?.firstEditableChild;
        if (!!first) {
            this.selectBoxNew(first);
        }
    }

    /**
     * Sets the next sibling of the currently selected box to be the selected box.
     * TODO what if there is no next sibling?
     */
    selectNextLeaf() {
        const next = this.selectedBox?.nextLeafRight;
        LOGGER.log("!!!!!!! Select next leaf is box " + next?.role);
        if (!!next) {
            this.selectBoxNew(next, PiCaret.LEFT_MOST);
            // if (isTextBox(next) || isSelectBox(next)) {
            //     next.setCaret(PiCaret.LEFT_MOST);
            // }
        }
    }

    /**
     * Sets the previous sibling of the currently selected box to be the selected box.
     * TODO what if there is no previous sibling?
     */
    selectPreviousLeaf() {
        const previous = this.selectedBox?.nextLeafLeft;
        if (!!previous) {
            this.selectBoxNew(previous, PiCaret.RIGHT_MOST);
            // previous.setFocus();
            // if (isTextBox(previous) || isSelectBox(previous)) {
            //     LOGGER.log("!!!!!!! selectPreviousLeaf set caret to RIGHTMOST ");
            //     previous.setCaret(PiCaret.RIGHT_MOST);
            // }
        }
    }

    /**
     * Finds a new box for the element attached to 'box' within the projection, and selects this one.
     * TODO more explanation why this is needed
     * @param box
     * @param caretPosition
     */
    selectBoxNew(box: Box, caretPosition?: PiCaret) {
        LOGGER.log("SelectBoxNEW: " + (box ? box.role : box) + "  caret " + caretPosition?.position + " NOSELECT[" + this.NOSELECT + "]");
        if (this.NOSELECT) {
            return;
        }
        this.selectBox(this._rootBox.findBox(box.element.piId(), box.role), caretPosition);
    }

    /**
     * Deletes 'box', and removes the element associated with it from the model.
     * @param box
     */
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
        wait(0);
        const x = box.actualX + this.scrollX;
        const y = box.actualY + this.scrollY;
        let result: Box = box.nextLeafLeft;
        let tmpResult = result;
        LOGGER.log("boxAbove " + box.role + ": " + Math.round(x) + ", " + Math.round(y) + " text: " +
            (isTextBox(box) ? box.getText() : "NotTextBox"));
        while (result !== null) {
            LOGGER.log("previous : " + result.role + "  " + Math.round(result.actualX + this.scrollX) + ", " + Math.round(result.actualY + this.scrollY));
            if (PiEditor.isOnPreviousLine(tmpResult, result) && PiEditor.isOnPreviousLine(box, tmpResult)) {
                return tmpResult;
            }
            if (PiEditor.isOnPreviousLine(box, result)) {
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
    // TODO rethink the parameter 'box' in all of these methods => should work on currently selected box

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
            if (PiEditor.isOnNextLine(tmpResult, result) && PiEditor.isOnNextLine(box, tmpResult)) {
                LOGGER.log("Found box below 1 [" + (!!tmpResult ? tmpResult.role : "null") + "]");
                return tmpResult;
            }
            if (PiEditor.isOnNextLine(box, result)) {
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

    /**
     * TODO
     * @param piCustomAction
     */
    addOrReplaceAction(piCustomAction: PiAction) {
        // LOGGER.log("   addOrReplaceAction [" + triggerTypeToString(piCustomAction.trigger) + "] [" + piCustomAction.activeInBoxRoles + "]");

        // this.new_pi_actions.forEach(act => {
        //     LOGGER.log("   Trigger [" + triggerTypeToString(act.trigger) + "] [" + act.activeInBoxRoles + "]");
        // })
        const alreadyThere = this.newPiActions.findIndex(action => {
            return isEqual(action.trigger, piCustomAction.trigger) && isEqual(action.activeInBoxRoles, piCustomAction.activeInBoxRoles);
        });
        // console.log("  alreadyThere: " + alreadyThere);
        if (alreadyThere !== -1) { // found it
            this.newPiActions.splice(alreadyThere, 1, piCustomAction);
        } else {
            this.newPiActions.splice(0, 0, piCustomAction);
        }
    }

    /**
     * TODO
     * @param box
     * @param caretPosition
     * @private
     */
    private selectBox(box: Box | null, caretPosition?: PiCaret) {
        if (this.NOSELECT) {
            return;
        }
        if (box === null || box === undefined) {
            console.error("PiEditor.selectBox is null !");
            return;
        }
        LOGGER.log("selectBox: " + (!!box ? box.role : box) + " caret " + caretPosition?.position);
        if (box === this.selectedBox) {
            LOGGER.info("box already selected");
            return;
        }
        if (isActionBox(box)) {
            this.selectedBox = box.textBox;
        } else {
            this.selectedBox = box;
        }
        LOGGER.log("selectBox: select box " + this.selectedBox.role + " caret position: " + (!!caretPosition ? caretPosition.position : "undefined"));
        if (isTextBox(box) || isActionBox(box) || isSelectBox(box)) {
            if (!!caretPosition) {
                LOGGER.log("caret position is " + caretPosition.position);
                box.setCaret(caretPosition);
            } else {
                LOGGER.log("caret position is empty");
                box.setCaret(PiCaret.RIGHT_MOST);
            }
        }
        // we do not set focus, see the comment for the setFocus method in Box.ts
    }

    /**
     * TODO
     * @param actions
     * @private
     */
    private initializeAliases(actions?: PiCombinedActions) {
        if (!actions) {
            return;
        }
        actions.customActions.forEach(ca => this.newPiActions.push(ca));
        actions.binaryExpressionActions.forEach(ca => this.newPiActions.push(ca));
    }
}
