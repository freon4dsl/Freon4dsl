import { isEqual } from "lodash";
import { autorun, computed, makeObservable, observable } from "mobx";
import { PiEnvironment } from "../environment";
import { PiOwnerDescriptor, PiElement } from "../ast";
import { PiLogger } from "../logging";
import { PiAction } from "./actions";
import {
    Box,
    PiCombinedActions,
    PiCaret,
    FreProjectionHandler,
    wait,
    isTextBox
} from "./index";
import { SeverityType } from "../validator";
import { isNullOrUndefined } from "../util";

const LOGGER = new PiLogger("PiEditor");

export class PiEditor {
    readonly actions?: PiCombinedActions;       // All actions with which this editor is created.
    readonly projection: FreProjectionHandler;  // The root projection with which this editor is created.
    newPiActions: PiAction[] = [];              // List of PiActions composed of all the actions in 'actions'
    environment: PiEnvironment;                 // The generated language environment, needed to find reference shortcuts in the Action box.
    copiedElement: PiElement;                   // The element that is currently handled in a cut/copy-paste situation.
    // todo are the scroll values needed? Do not the boundingRectable values for each HTML element depend on the page, not on the viewport?
    scrollX: number = 0;                        // The amount of scrolling horizontally, to find the element above and under.
    scrollY: number = 0;                        // The amount of scrolling vertically, to find the element above and under.

    private _rootElement: PiElement = null;     // The model element to be shown in this editor.
    private _rootBox: Box | null = null;        // The box that is defined for the _rootElement. Note that it is a 'slave' to _rootElement.
    private _selectedElement: PiElement = null; // The model element, or the parent element of the property, that is currently selected in the editor.
    private _selectedProperty: string = '';     // The property that is currectly selected in the editor, if applicable.
    private _selectedIndex: number = -1;        // The index within the property that is currectly selected in the editor, if applicable.
    private _selectedBox: Box | null = null;    // The box defined for _selectedElement. Note that it is a 'slave' to _selectedElement.
    private _selectedPosition: PiCaret = PiCaret.UNSPECIFIED;   // The caret position within the _selectedBox.
    private NOSELECT: Boolean = false;          // Do not accept "select" actions, used e.g. when an undo is going to come.

    /**
     * The constructor makes a number of private properties observable.
     * @param projection
     * @param environment
     * @param actions
     */
    constructor(projection: FreProjectionHandler, environment: PiEnvironment, actions?: PiCombinedActions) {
        this.actions = actions;
        this.projection = projection;
        this.environment = environment;
        this.initializeActions(actions);
        makeObservable<PiEditor, "_rootElement">(this, {
            // theme: observable,
            _rootElement: observable,
            rootElement: computed
        });
        autorun(this.auto);
    }

    // The refresh method from the component that displays this box.
    refreshComponentSelection: (why?: string) => void;
    refreshComponentRootBox: (why?: string) => void;

    // Called when the editor selection has changed
    selectionChanged(): void {
        if (this.refreshComponentSelection !== undefined && this.refreshComponentSelection !== null) {
            this.refreshComponentSelection("====== FROM PiEditor");
        } else {
            LOGGER.log("No selectionChanged() for PiEditor");
        }
    }

    // Called when the editor/rootbox is dirty, refreshes the main component.
    rootBoxChanged(): void {
        if (this.refreshComponentRootBox !== undefined && this.refreshComponentRootBox !== null) {
            this.refreshComponentRootBox("====== FROM PiEditor");
        } else {
            LOGGER.log("No refreshComponentRootBox() for PiEditor");
        }
    }

    auto = () => {
        console.log("CALCULATE NEW ROOTBOX rootelement is " + this?.rootElement?.piLanguageConcept());
        if (this.rootElement !== null) {
            this._rootBox = this.projection.getBox(this.rootElement);
            this.rootBoxChanged();
        }
    }

    // Getters and Setters

    /**
     * Sets a new root element in this editor, calculates the projection for this element,
     * which returns the root box.
     * @param exp
     */
    set rootElement(exp: PiElement) {
        this._rootElement = exp;
        // select first editable child
        this.selectFirstEditableChildBox(exp);
    }

    get rootElement(): PiElement {
        return this._rootElement;
    }

    get rootBox(): Box {
        return this._rootBox;
    }

    get selectedBox(): Box {
        return this._selectedBox;
    }

    get selectedElement(): PiElement {
        return this._selectedElement;
    }

    get selectedItem(): PiOwnerDescriptor {
        return { owner: this._selectedElement, propertyName: this._selectedProperty, propertyIndex: this._selectedIndex};
    }

    /**
     * The only setter for _selectedElement, used to programmatically select an element,
     * e.g. from the webapp or caused by a model change on the server.
     * @param element
     * @param propertyName
     * @param propertyIndex
     * @param caretPosition
     */
    selectElement(element: PiElement, propertyName?: string, propertyIndex?: number, caretPosition?: PiCaret) {
        console.log("selectElement " + element?.piLanguageConcept() + " with id " + element?.piId() + ", property: ["  + propertyName + ", " + propertyIndex + "]");
        if (this.checkParam(element)) {
            let box = this.projection.getBox(element);
            let propBox = box.findChildBoxForProperty(propertyName, propertyIndex);
            if (!isNullOrUndefined(propBox)) {
                this._selectedBox = propBox;
                this._selectedProperty = propertyName;
                this._selectedIndex = propertyIndex;
                this._selectedPosition = caretPosition;
            } else {
                this._selectedBox = box;
                this._selectedProperty = '';
                this._selectedIndex = -1;
                this._selectedPosition = PiCaret.UNSPECIFIED;
            }
            this._selectedElement = element;
            this.selectionChanged();
        }
    }

    /**
     * Sets 'element' to be the selectedElement, and its first child, which is editable, to the selectedBox.
     * @param element
     */
    selectFirstEditableChildBox(element: PiElement) {
        if (this.checkParam(element)) {
            const first = this.projection.getBox(element).firstEditableChild;
            if (!isNullOrUndefined(first)) {
                this._selectedBox = first;
                this._selectedProperty = first.propertyName;
                this._selectedIndex = first.propertyIndex;
                this._selectedPosition = PiCaret.LEFT_MOST;
            }
            this._selectedElement = element;
            this.selectionChanged();
        }
    }

    private checkParam(element: PiElement): boolean  {
        if (this.NOSELECT) {
            return false;
        }
        if (isNullOrUndefined(element)) {
            console.error("PiEditor.selectedElement is null !");
            return false;
        }
        return true;
    }

    /**
     * Selects the element associated with 'box'.
     * @param box
     * @param caret
     */
    selectElementForBox(box: Box, caret?: PiCaret) {
        if (!isNullOrUndefined(box) && box !== this._selectedBox) { // only (re)set the local variables when the box can be found
            this._selectedElement = box.element;
            if (!box.selectable) {
                // get the ElementBox for the selected element
                this._selectedBox = this.projection.getBox(box.element);
                // console.log('box not selectable: ' + box.kind)
            } else {
                this._selectedBox = box;
            }
            this._selectedIndex = this._selectedBox.propertyIndex;
            this._selectedProperty = this._selectedBox.propertyName;
            this._selectedPosition = !!caret? caret : PiCaret.UNSPECIFIED;
            // TODO Only needed when something actually changed
            this.selectionChanged();
        }
        // console.log(`==>     this._selectedElement = ${this._selectedElement.piId()}=${this._selectedElement.piLanguageConcept()};
        // this._selectedBox = ${this._selectedBox.role} of kind ${this._selectedBox.kind};
        // this._selectedIndex = ${this._selectedIndex};
        // this._selectedProperty = ${this._selectedProperty};`);
    }

    selectParent() {
        this.selectParentForBox(this.selectedBox);
    }

    private selectParentForBox(box: Box) { // private method needed because of recursion
        console.log("==> selectParent of " + box?.role + ' of kind ' + box?.kind);
        let parent = box?.parent;
        if (!!parent) {
            // todo too much recursion when called from a Dropdown!!!
            if (parent.selectable) {
                this.selectElementForBox(parent);
            } else {
                this.selectParentForBox(parent);
            }
        }
    }

    /**
     * Deletes 'box', and removes the element associated with it from the model.
     * @param box
     */
    deleteBox(box: Box) {
        LOGGER.log("deleteBox");
        const exp: PiElement = box.element;
        const ownerDescriptor: PiOwnerDescriptor = exp.piOwnerDescriptor();
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
     * @param actions
     * @private
     */
    private initializeActions(actions?: PiCombinedActions) {
        if (!actions) {
            return;
        }
        actions.customActions.forEach(ca => this.newPiActions.push(ca));
        actions.binaryExpressionActions.forEach(ca => this.newPiActions.push(ca));
    }

    /**
     * Relays any message to the user. Function should be overridden by the webapp or any other part that is able to show
     * the message to the user.
     * @param message       The message.
     * @param severityType  The severity of the message (information, hint, warning, or error).
     */
    setUserMessage(message: string, severityType?: SeverityType) {
        console.log('This message should be shown elsewhere: "' + message + '", please override this method appropriately.', severityType)
    }

    /**
     * Sets the previous sibling of the currently selected box to be the selected box.
     * TODO what if there is no previous sibling?
     */
    selectPreviousLeaf() {
        const previous = this.selectedBox?.nextLeafLeft;
        LOGGER.log("Select previous leaf is box " + previous?.role);
        if (!!previous) {
            this.selectElementForBox(previous, PiCaret.RIGHT_MOST);
        }
    }

    /**
     * Sets the next sibling of the currently selected box to be the selected box.
     * TODO what if there is no next sibling?
     */
    selectNextLeaf() {
        const next = this._selectedBox?.nextLeafRight;
        LOGGER.log("Select next leaf is box " + next?.role);
        if (!!next) {
            this.selectElementForBox(next, PiCaret.LEFT_MOST);
        }
    }

    /**
     * Sets the first editable/selectable child of the currently selected box to be the selected box.
     */
    selectFirstLeafChildBox() {
        const first = this.selectedBox?.firstLeaf;
        if (!!first) {
            this.selectElementForBox(first);
        }
    }

    /**
     * Returns the box that is visually above `box`.
     * @param box
     */
    private boxAbove(box: Box): Box {
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
    private boxBelow(box: Box): Box {
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

    selectBoxBelow(box: Box) {
        const down = this.boxBelow(box);
        if (down !== null && down !== undefined) {
            this.selectElementForBox(down);
        }
    }

    selectBoxAbove(box: Box) {
        const up = this.boxAbove(box);
        if (up !== null) {
            this.selectElementForBox(up);
        }
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

}
