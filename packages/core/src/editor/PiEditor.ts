import { observable, computed, action } from "mobx";

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
    PiActions
} from "./internal";

const LOGGER = new PiLogger("PiEditor"); //.mute();

export class PiEditor {
    @observable private _rootElement: PiElement;
    readonly actions?: PiActions;
    readonly projection: PiProjection;
    readonly behaviors: InternalBehavior[] = [];
    keyboardActions: KeyboardShortcutBehavior[] = [];

    @observable private $rootBox: Box | null;
    @observable private $selectedBox: Box | null;
    private $projectedElement: HTMLDivElement | null;

    private selectedElement: PiElement = null;
    selectedPosition: PiCaret = PiCaret.UNSPECIFIED;
    private selectedRole: string = null;

    constructor(projection: PiProjection, actions?: PiActions) {
        this.actions = actions;
        this.projection = projection;
        this.initializeAliases(actions);
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

    async selectElement(element: PiElement, role?: string, caretPosition?: PiCaret) {
        if (element === null || element === undefined) {
            console.error("PiEditor.selectElement is null !");
            return;
        }
        this.selectedElement = element;
        this.selectedRole = role;
        this.selectedPosition = caretPosition;
        wait(0);
        LOGGER.info(this, "==> selectElement " + (!!element && element) + " Role: " + role);
        const rootBox = this.rootBox;
        const box = rootBox.findBox(element.piId(), role);
        LOGGER.info(this, "-==> selectElement found box " + (!!box && box.kind));
        if (box) {
            await this.selectBox(box, caretPosition);
        } else {
            if (!!role) {
                LOGGER.info(this, "Trying without role");
                await this.selectElement(element);
                this.selectedRole = role;
                this.selectedPosition = caretPosition;
            }
        }
    }

    async selectBox(box: Box | null, caretPosition?: PiCaret) {
        if (box === null || box === undefined) {
            console.error("PiEditor.selectBox is null !");
            return;
        }
        LOGGER.info(this, "selectBox "+ (!!box? box.role : box) );
        if (box === this.selectedBox) {
            LOGGER.info(this, "box already selected");
            return;
        }
        this.selectedBox = box;
        // this.$projectedElement!.focus();
        if (box === null) {
            LOGGER.info(this, "box === null");
            return;
        }

        LOGGER.info(this, "==> select box " + box.role + " caret position: " + caretPosition);
        if (isTextBox(box) || isAliasBox(box) || isSelectBox(box)) {
            if (caretPosition) {
                LOGGER.info(this, "caret position is " + caretPosition);
                box.setCaret(caretPosition);
            } else {
                LOGGER.info(this, "caret position is empty");
                box.setCaret(PiCaret.RIGHT_MOST);
            }
        }
        LOGGER.info(this, "setting focus on box " + box.role);
        await box.setFocus();
    }

    get selectedBox() {
        return this.$selectedBox;
    }

    set selectedBox(box: Box) {
        LOGGER.info(this, " ==> set selected box: " + (!!box ? box.role : "null"));
        this.$selectedBox = box;
        if (!!box) {
            this.selectedElement = box.element;
            this.selectedRole = box.role;
        }
    }

    @computed
    get rootBox(): Box {
        LOGGER.info(this, "RECALCULATING ROOT [" + this.rootElement + "]");
        return this.projection.getBox(this.rootElement);
        // return this.$rootBox;
    }

    selectParentBox() {
        LOGGER.info(this, "==> SelectParent");
        const parent = this.selectedBox.parent;
        if (!!parent) {
            if (parent.selectable) {
                this.selectBox(parent);
                parent.setFocus();
            } else {
                this.selectBox(parent);
                this.selectParentBox();
            }
        }
    }

    selectFirstLeafChildBox() {
        const first = this.selectedBox.firstLeaf;
        if (!!first) {
            this.selectBox(first);
        }
    }

    selectNextLeaf() {
        const next = this.selectedBox.nextLeafRight;
        if (!!next) {
            this.selectBox(next);
            next.setFocus();
            if (isTextBox(next) || isSelectBox(next)) {
                next.setCaret(PiCaret.LEFT_MOST);
            }
        }
    }

    async selectPreviousLeaf() {
        const previous = this.selectedBox.nextLeafLeft;
        if (!!previous) {
            await this.selectBox(previous);
            previous.setFocus();
            if (isTextBox(previous) || isSelectBox(previous)) {
                LOGGER.info(this, "selectPreviousLeaf set caret to RIGHT_MOST");
                previous.setCaret(PiCaret.RIGHT_MOST);
            }
        }
    }

    @action
    async deleteBox(box: Box) {
        LOGGER.info(this, "deleteBox");
        const exp: PiElement = box.element;
        const container: PiContainerDescriptor = exp.piContainer();
        // if (isPiExpression(exp)) {
        //     const newExp = this.getPlaceHolderExpression();
        //     PiUtils.replaceExpression(exp, newExp, this);
        //     await this.selectElement(newExp);
        // } else {
            if (container !== null) {
                LOGGER.info(this, "remove from parent splice " + [container.propertyIndex] + ", 1");
                const propertyIndex = container.propertyIndex;
                const parentElement = container.container;
                if (propertyIndex !== undefined) {
                    let arrayProperty = (container.container as any)[container.propertyName] as any;
                    arrayProperty.splice(propertyIndex, 1);
                    let length = arrayProperty.length;
                    if (length === 0) {
                        // TODO Maybe we should select the element (or leaf) just before the list.
                        await this.selectElement(parentElement,`${container.container.piLanguageConcept()}-${container.propertyName}`);
                    } else if (length <= propertyIndex) {
                        await this.selectElement(arrayProperty[propertyIndex - 1]);
                    } else {
                        await this.selectElement(arrayProperty[propertyIndex]);
                    }
                } else {
                    container.container[container.propertyName] = null;
                    // TODO The rolename is identical to the one generated in Roles.ts,  should not be copied here
                    await this.selectElement(container.container,
                        (container.container.piIsBinaryExpression() ? `PiBinaryExpression-${container.propertyName}` : `${container.container.piLanguageConcept()}-${container.propertyName}`))
                }
            }
        // }
    }

    async selectFirstEditableChildBox() {
        const first = this.selectedBox.firstEditableChild;
        LOGGER.info(this, "selectFirstEditableChildBox: " + first.kind + " elem: " + first.element + "  role " + first.role);
        if (first) {
            LOGGER.info(this, "selectFirstEditableChildBox: first found with role " + first.role);
            this.selectBox(first);
        }
    }

    set rootElement(exp: PiElement) {
        this._rootElement = exp;
        this.$rootBox = this.projection.getBox(this._rootElement)
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
