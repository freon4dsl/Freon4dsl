import { makeObservable, observable, computed, action, trace } from "mobx";
import { PiEnvironment } from "../environment/PiEnvironment";

import { PiContainerDescriptor, PiElement } from "../language";
import { PiCaret, wait, PiLogger } from "../util";
import {
    InternalBehavior,
    InternalBinaryBehavior,
    InternalCustomBehavior,
    InternalExpressionBehavior,
    PiProjection,
    isAliasBox,
    isSelectBox,
    isTextBox,
    Box,
    KeyboardShortcutBehavior,
    PiActions, PiEditorStyle
} from "./internal";

const LOGGER = new PiLogger("PiEditor");

export class PiEditor {
    private _rootElement: PiElement = null;
    readonly actions?: PiActions;
    readonly projection: PiProjection;
    readonly behaviors: InternalBehavior[] = [];
    keyboardActions: KeyboardShortcutBehavior[] = [];
    style: PiEditorStyle = { global: { dark: {}, light: {}}};
    theme: string = "light";

    private $rootBox: Box | null = null;
    private $selectedBox: Box | null = null;
    private $projectedElement: HTMLDivElement | null;

    private selectedElement: PiElement = null;
    selectedPosition: PiCaret = PiCaret.UNSPECIFIED;
    private selectedRole: string = null;

    /**
     * Needed to find reference shortcuts in the Alias box
     */
    environment: PiEnvironment;

    /**
     * The amount of scrolling horizontally.
     * Needed to find the element above and under.
     */
    scrollX: number = 0;
    /**
     * The amount of scrolling vertically
     * Needed to find the element above and under.
     */
    scrollY: number = 0;

    constructor(projection: PiProjection, actions?: PiActions) {
        this.actions = actions;
        this.projection = projection;
        this.initializeAliases(actions);

        makeObservable<PiEditor, "$rootBox" | "selectedRole" | "$selectedBox" | "selectedElement" | "_rootElement">(this, {
            $rootBox: observable,
            _rootElement: observable,
            $selectedBox: observable,
            selectedElement: observable,
            selectedRole: observable,
            theme: observable,
            selectedBox: computed,
            deleteBox: action,
            rootBox: computed,

        });
    }

    initializeAliases(actions?: PiActions) {
        if (!actions) {
            return;
        }
        actions.expressionCreators.forEach(ea => this.behaviors.push(new InternalExpressionBehavior(ea)));
        actions.binaryExpressionCreators.forEach(ba => this.behaviors.push(new InternalBinaryBehavior(ba)));
        actions.customBehaviors.forEach(ca => this.behaviors.push(new InternalCustomBehavior(ca)));
        this.keyboardActions = actions.keyboardActions;
    }

    get projectedElement() {
        return this.$projectedElement;
    }

    set projectedElement(e: HTMLDivElement) {
        this.$projectedElement = e;
    }

    /**
     * Do not accept "select" actions, used e.g. when an undo is going to come.
     */
    NOSELECT: Boolean = false;

    selectElement(element: PiElement, role?: string, caretPosition?: PiCaret) {
        LOGGER.log("selectElement " + element.piLanguageConcept());
        if( this.NOSELECT) { return; }
        if (element === null || element === undefined) {
            console.error("PiEditor.selectElement is null !");
            return;
        }
        this.selectedElement = element;
        this.selectedRole = role;
        this.selectedPosition = caretPosition;
        // wait(0);
        LOGGER.log("selectElement: selectElement " + (!!element && element) + " Role: " + role + " caret: " + caretPosition?.position);
        const rootBox = this.$rootBox;
        const box = rootBox.findBox(element.piId(), role);
        LOGGER.log("selectElement: selectElement found box " + box?.kind);
        if (!!box) {
            this.selectBoxNew(box, caretPosition);
        } else {
            if (!!role) {
                // TODO Does not work ok
                LOGGER.log("seletElement: Trying without role, element id is " + element.piId());
                const box = rootBox.findBox(element.piId());
                LOGGER.log("selectElement: selectElement found main box " + box?.kind);
                // this.selectElement(element);
                // this.selectedRole = role;
                // this.selectedPosition = caretPosition;
            }
        }
    }

    selectBoxNew(box: Box, caretPosition?: PiCaret) {
        LOGGER.log("SelectBoxNEW: " + (box ? box.role : box) + "  caret " + caretPosition?.position + " NOSELECT[" + this.NOSELECT + "]");
        if( this.NOSELECT) { return; }
        this.selectBox(this.$rootBox.findBox(box.element.piId(), box.role), caretPosition);
    }

    selectBoxByRoleAndElementId(elementId: string, role: string, caretPosition?: PiCaret) {
        LOGGER.log("selectBoxByRoleAndElementId " + elementId + "  role " + role);
        if( this.NOSELECT) { return; }
        this.selectBox(this.$rootBox.findBox(elementId, role));
    }

    private selectBox(box: Box | null, caretPosition?: PiCaret) {
        if( this.NOSELECT) { return; }
        if (box === null || box === undefined) {
            console.error("PiEditor.selectBox is null !");
            return;
        }
        LOGGER.log("selectBox: " + (!!box ? box.role : box) + " caret " + caretPosition?.position);
        if (box === this.selectedBox) {
            LOGGER.info(this, "box already selected");
            return;
        }
        if (isAliasBox(box)) {
            this.selectedBox = box.textBox;
        } else {
            this.selectedBox = box;
        }
        LOGGER.log("selectBox: select box " + this.selectedBox.role + " caret position: " + (!!caretPosition ? caretPosition.position : "undefined"));
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

    get selectedBox() {
        return this.$selectedBox;
    }

    set selectedBox(box: Box) {
        LOGGER.log("selecteedBox:  set selected box to: " + (!!box ? box.role : "null") + "  NOSELECT [" + this.NOSELECT + "]");
        if( this.NOSELECT) { return; }

        if (isAliasBox(box)) {
            this.$selectedBox = box.textBox;
        } else {
            this.$selectedBox = box;
        }
        if (!!box) {
            this.selectedElement = this.$selectedBox.element;
            this.selectedRole = this.$selectedBox.role;
        }
    }

    get rootBox(): Box {
        LOGGER.log("RECALCULATING ROOT [" + this.rootElement + "]");
        // trace(true);
        const result =  this.projection.getBox(this.rootElement);
        LOGGER.log("Root box id is " + result.$id);
        this.$rootBox = result;
        LOGGER.log("Root box id is set now");
        return result
    }

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
                // parent.setFocus();
            } else {
                this.selectBoxNew(parent);
                this.selectParentBox();
            }
        }
    }

    selectFirstLeafChildBox() {
        const first = this.selectedBox.firstLeaf;
        if (!!first) {
            this.selectBoxNew(first);
            // first.setFocus();
        }
    }

    selectNextLeaf() {
        const next = this.selectedBox.nextLeafRight;
        LOGGER.log("!!!!!!! Select next leaf is box " + next?.role);
        if (!!next) {
            this.selectBoxNew(next, PiCaret.LEFT_MOST);
            // if (isTextBox(next) || isSelectBox(next)) {
            //     next.setCaret(PiCaret.LEFT_MOST);
            // }
        }
    }

    selectPreviousLeaf() {
        const previous = this.selectedBox.nextLeafLeft;
        if (!!previous) {
            this.selectBoxNew(previous, PiCaret.RIGHT_MOST);
            // previous.setFocus();
            // if (isTextBox(previous) || isSelectBox(previous)) {
            //     LOGGER.log("!!!!!!! selectPreviousLeaf set caret to RIGHTMOST ");
            //     previous.setCaret(PiCaret.RIGHT_MOST);
            // }
        }
    }

    deleteBox(box: Box) {
        LOGGER.log("deleteBox");
        const exp: PiElement = box.element;
        const container: PiContainerDescriptor = exp.piContainer();
        // if (isPiExpression(exp)) {
        //     const newExp = this.getPlaceHolderExpression();
        //     PiUtils.replaceExpression(exp, newExp, this);
        //     await this.selectElement(newExp);
        // } else {
        if (container !== null) {
            LOGGER.log("remove from parent splice " + [container.propertyIndex] + ", 1");
            const propertyIndex = container.propertyIndex;
            const parentElement = container.container;
            if (propertyIndex !== undefined) {
                let arrayProperty = (container.container as any)[container.propertyName] as any;
                arrayProperty.splice(propertyIndex, 1);
                let length = arrayProperty.length;
                if (length === 0) {
                    // TODO Maybe we should select the element (or leaf) just before the list.
                    this.selectElement(parentElement, `${container.container.piLanguageConcept()}-${container.propertyName}`);
                } else if (length <= propertyIndex) {
                    this.selectElement(arrayProperty[propertyIndex - 1]);
                } else {
                    this.selectElement(arrayProperty[propertyIndex]);
                }
            } else {
                container.container[container.propertyName] = null;
                // TODO The rolename is identical to the one generated in Roles.ts,  should not be copied here
                this.selectElement(container.container,
                    (container.container.piIsBinaryExpression() ? `PiBinaryExpression-${container.propertyName}` : `${container.container.piLanguageConcept()}-${container.propertyName}`));
            }
        }
        // }
    }

    selectFirstEditableChildBox() {
        const first = this.selectedBox.firstEditableChild;
        LOGGER.log("selectFirstEditableChildBox: " + first.kind + " elem: " + first.element + "  role " + first.role);
        if (first) {
            LOGGER.info(this, "selectFirstEditableChildBox: first found with role " + first.role);
            this.selectBoxNew(first);
        }
    }

    /**
     * Return the box that is visually above `box`.

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

    private isOnPreviousLine(ref: Box, other: Box): boolean {
        const margin = 5;
        return other.actualY + margin < ref.actualY;
    }

    private isOnNextLine(ref: Box, other: Box): boolean {
        return this.isOnPreviousLine(other, ref);
    }


    set rootElement(exp: PiElement) {
        this._rootElement = exp;
        this.$rootBox = this.projection.getBox(this._rootElement);
        // if (exp instanceof MobxModelElementImpl) {
        //     exp.container = this;
        //     exp.propertyIndex = undefined;
        //     exp.propertyName = "rootElement";
        //     // not a PiElement , therefore no root.
        //     // exp.container = null;
        // }
    }

    get rootElement(): PiElement {
        return this._rootElement;
    }

}
