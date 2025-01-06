import pkg from 'lodash';
const { isEqual } = pkg;

import { autorun, makeObservable, observable } from "mobx";
import { AST } from "../change-manager/index.js";
import { FreEnvironment } from "../environment/index.js";
import { FreOwnerDescriptor, FreNode, FreNodeReference } from "../ast/index.js";
import { FreLanguage, FreLanguageClassifier, FreLanguageProperty } from "../language/index.js";
import { FreLogger } from "../logging/index.js";
import { FreAction } from "./actions/index.js";
import {
    Box,
    FreCombinedActions,
    FreCaret,
    FreProjectionHandler,
    // wait,
    isTextBox,
    ElementBox,
    RoleProvider
} from "./index.js";
import { FreError, FreErrorSeverity } from "../validator/index.js";
import { isExpressionPreOrPost, isNullOrUndefined, LEFT_MOST } from "../util/index.js";
import {FreErrorDecorator} from "./FreErrorDecorator.js";

const LOGGER = new FreLogger("FreEditor").mute();

export class FreEditor {
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

    readonly actions?: FreCombinedActions; // All actions with which this editor is created.
    readonly projection: FreProjectionHandler; // The root projection with which this editor is created.
    newFreActions: FreAction[] = []; // List of FreActions composed of all the actions in 'actions'
    environment: FreEnvironment; // The generated language environment, needed to find reference shortcuts in the Action box.
    copiedElement: FreNode; // The element that is currently handled in a cut/copy-paste situation.
    // todo are the scroll values needed? Do not the boundingRectable values for each HTML element depend on the page, not on the viewport?
    scrollX: number = 0; // The amount of scrolling horizontally, to find the element above and under.
    scrollY: number = 0; // The amount of scrolling vertically, to find the element above and under.

    private _rootElement: FreNode = null; // The model element to be shown in this editor.
    private _rootBox: Box | null = null; // The box that is defined for the _rootElement. Note that it is a 'slave' to _rootElement.
    private _selectedElement: FreNode = null; // The model element, or the parent element of the property, that is currently selected in the editor.
    private _selectedProperty: string = ""; // The property that is currently selected in the editor, if applicable.
    private _selectedIndex: number = -1; // The index within the property that is currently selected in the editor, if applicable.
    private _selectedBox: Box | null = null; // The box defined for _selectedElement. Note that it is a 'slave' to _selectedElement.
    private _selectedPosition: FreCaret = FreCaret.UNSPECIFIED; // The caret position within the _selectedBox.
    private NOSELECT: Boolean = false; // Do not accept "select" actions, used e.g. when an undo is going to come.
    private _errorDecorator: FreErrorDecorator = null;

    /**
     * The constructor makes a number of private properties observable.
     * @param projection
     * @param environment
     * @param actions
     */
    constructor(projection: FreProjectionHandler, environment: FreEnvironment, actions?: FreCombinedActions) {
        this.actions = actions;
        this.projection = projection;
        this.environment = environment;
        this._errorDecorator = new FreErrorDecorator(this);
        this.initializeActions(actions);
        makeObservable<FreEditor, "_rootElement">(this, {
            // theme: observable,
            _rootElement: observable,
            forceRecalculateProjection: observable
        });
        autorun(this.auto);
    }

    // The refresh method from the component that displays this box.
    refreshComponentSelection: (why?: string) => void;
    refreshComponentRootBox: (why?: string) => void;

    // Called when the editor selection has changed
    selectionChanged(): void {
        if (this.refreshComponentSelection !== undefined && this.refreshComponentSelection !== null) {
            LOGGER.log("selectionChanged() for FreEditor");
            this.refreshComponentSelection("====== FROM FreEditor");
        } else {
            LOGGER.log("No selectionChanged() for FreEditor");
        }
    }

    // Called when the editor/rootbox is dirty, refreshes the main component.
    rootBoxChanged(): void {
        if (this.refreshComponentRootBox !== undefined && this.refreshComponentRootBox !== null) {
            this.refreshComponentRootBox("====== FROM FreEditor");
        } else {
            LOGGER.log("No refreshComponentRootBox() for FreEditor");
        }
    }

    auto = () => {
        LOGGER.log("CALCULATE NEW ROOTBOX rootelement is " + this?.rootElement?.freLanguageConcept() + " recalc is " + this.forceRecalculateProjection);
        this.forceRecalculateProjection
        if (this.rootElement !== null) {
            this._rootBox = this.projection.getBox(this.rootElement);
            this.rootBoxChanged();
        }
    };

    /**
     * Increase this value to force recalculation of the projection.
     * Used e.g. when projection list changes.
     */
    forceRecalculateProjection: number = 0

    // Getters and Setters

    /**
     * Sets a new root element in this editor, calculates the projection for this element,
     * which returns the root box.
     * @param node
     */
    set rootElement(node: FreNode) {
        this._rootElement = node;
        // select first editable child
        this.selectFirstEditableChildBox(node);
    }

    get rootElement(): FreNode {
        return this._rootElement;
    }

    get rootBox(): Box {
        return this._rootBox;
    }

    get selectedBox(): Box {
        return this._selectedBox;
    }

    get selectedElement(): FreNode {
        return this._selectedElement;
    }

    get selectedItem(): FreOwnerDescriptor {
        return {
            owner: this._selectedElement,
            propertyName: this._selectedProperty,
            propertyIndex: this._selectedIndex,
        };
    }

    set selectedCaretPosition(c: FreCaret) {
        this._selectedPosition = c;
    }

    get selectedCaretPosition(): FreCaret {
        return this._selectedPosition;
    }

    /**
     * The only setter for _selectedElement, used to programmatically select an element,
     * e.g. from the webapp or caused by a model change on the server.
     * @param node
     * @param propertyName
     * @param propertyIndex
     * @param caretPosition
     */
    selectElement(node: FreNode, propertyName?: string, propertyIndex?: number, caretPosition?: FreCaret) {
        LOGGER.log(
            `selectElement ${node?.freLanguageConcept()} with id ${node?.freId()}, property: [${propertyName}, ${propertyIndex}] ${caretPosition}`
        );
        const box: Box = this.findBoxForNode(node, propertyName, propertyIndex);
        if (!isNullOrUndefined(box)) {
            if (box instanceof ElementBox) {
                this._selectedBox = box;
                this._selectedProperty = "";
                this._selectedIndex = -1;
            } else {
                this._selectedBox = box;
                this._selectedProperty = propertyName;
                this._selectedIndex = propertyIndex;
            }
            if (!isNullOrUndefined(caretPosition)) {
                LOGGER.log("Set caretPosition to " + caretPosition);
                this._selectedPosition = caretPosition;
            } else {
                this._selectedPosition = FreCaret.UNSPECIFIED;
            }
            this._selectedElement = node;
            this.selectionChanged();
        }
    }

    /**
     * Returns the box in the current projection that projects 'node', or when provided, the property with name
     * 'propertyName', and index 'propertyIndex'. If 'node', or its property, is not projected, then one of its
     * parents, the one that is projected, is returned.
     * @param node
     * @param propertyName
     * @param propertyIndex
     */
    findBoxForNode(node: FreNode, propertyName?: string, propertyIndex?: number): Box | undefined {
        LOGGER.log(
            `findBoxForNode ${node?.freLanguageConcept()} with id ${node?.freId()}, property: ${propertyName}[${propertyIndex}]`
        );
        if (this.checkParam(node) && !node.freIsModel()) {
            const box: ElementBox = this.projection.getBox(node);
            // check whether the box is shown in the current projection
            if (isNullOrUndefined(box) || !this.isBoxInTree(box)) {
                // element is not shown, try selecting its parent
                return this.findBoxForNode(node.freOwner());
            } else {
                // try and find the property to be selected
                let propBox: Box | undefined = undefined;
                if (!isNullOrUndefined(propertyName)) {
                    propBox = box.findChildBoxForProperty(propertyName, propertyIndex);
                }
                if (!isNullOrUndefined(propBox)) {
                    return propBox;
                } else {
                    return box;
                }
            }
        }
        return undefined;
    }

    /**
     * Once the editor is running there may exist boxes, or small box trees that are not in the current projection.
     * This method checks whether the given box is in the current box tree.
     * @param box
     */
    isBoxInTree(box: Box): boolean {
        if (isNullOrUndefined(box)) {
            return false;
        }
        if (box === this._rootBox) {
            return true;
        }
        return this.isBoxInTree(box.parent);
    }

    /**
     * The only setter for _selectedElement, used to programmatically select an element,
     * e.g. from the webapp or caused by a model change on the server.
     * @param node
     * @param role
     * @param caretPosition
     */
    selectElementBox(node: FreNode, role: string, caretPosition?: FreCaret) {
        LOGGER.log(
            "selectElementBox " +
                node?.freLanguageConcept() +
                " with id " +
                node?.freId() +
                ", role: [" +
                role +
                "]" +
                " " +
                caretPosition,
        );
        if (this.checkParam(node)) {
            const box: ElementBox = this.projection.getBox(node);
            const propBox = box.findBoxWithRole(role);
            if (!isNullOrUndefined(propBox)) {
                this._selectedBox = propBox;
                // this._selectedProperty = propertyName;
                // this._selectedIndex = propertyIndex;
                this._selectedProperty = "";
                this._selectedIndex = -1;
            } else {
                this._selectedBox = box;
                this._selectedProperty = "";
                this._selectedIndex = -1;
            }
            if (!isNullOrUndefined(caretPosition)) {
                LOGGER.log("Set caretPosition to " + caretPosition);
                this._selectedPosition = caretPosition;
            } else {
                this._selectedPosition = FreCaret.UNSPECIFIED;
            }
            this._selectedElement = node;
            this.selectionChanged();
        }
    }

    /**
     * Sets 'element' to be the selectedElement, and its first child, which is editable, to the selectedBox.
     * @param element
     */
    selectFirstEditableChildBox(element: FreNode, skip: boolean = false) {
        if (this.checkParam(element)) {
            let first = this.projection.getBox(element).firstEditableChild;
            if (skip && first.role === LEFT_MOST) {
               first = first.nextLeafRight 
            }
            if (!isNullOrUndefined(first)) {
                this._selectedBox = first;
                this._selectedProperty = first.propertyName;
                this._selectedIndex = first.propertyIndex;
                this._selectedPosition = FreCaret.LEFT_MOST;
            }
            this._selectedElement = element;
            this.selectionChanged();
        }
    }

    private checkParam(element: FreNode): boolean {
        if (this.NOSELECT) {
            return false;
        }
        if (isNullOrUndefined(element)) {
            LOGGER.error("FreEditor.selectedElement is null !");
            return false;
        }
        return true;
    }

    /**
     * Selects the element associated with 'box'.
     * @param box
     * @param caret
     */
    selectElementForBox(box: Box, caret?: FreCaret) {
        if (!isNullOrUndefined(box) && box !== this._selectedBox) {
            // only (re)set the local variables when the box can be found
            this._selectedElement = box.node;
            if (!box.selectable) {
                // get the ElementBox for the selected element
                this._selectedBox = this.projection.getBox(box.node);
            } else {
                this._selectedBox = box;
            }
            this._selectedIndex = this._selectedBox.propertyIndex;
            this._selectedProperty = this._selectedBox.propertyName;
            this._selectedPosition = !!caret ? caret : FreCaret.UNSPECIFIED;
            // TODO Only needed when something actually changed
            this.selectionChanged();
        }
    }

    selectParent() {
        this.selectParentForBox(this.selectedBox);
    }

    private selectParentForBox(box: Box) {
        // private method needed because of recursion
        LOGGER.log("==> selectParent of " + box?.role + " of kind " + box?.kind);
        const parent = box?.parent;
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
        LOGGER.log(`deleteBox  ${box.id} for property ${box.propertyName}`);
        const node: FreNode = box.node;
        if (node.freIsUnit()) {
            return
        }
        const ownerDescriptor: FreOwnerDescriptor = node.freOwnerDescriptor();
        if (ownerDescriptor !== null) {
            const role: string = RoleProvider.property(ownerDescriptor.owner.freLanguageConcept(), ownerDescriptor.propertyName);
            LOGGER.log("remove from parent splice " + [ownerDescriptor.propertyIndex] + ", 1");
            const propertyIndex = ownerDescriptor.propertyIndex;
            const parentElement = ownerDescriptor.owner;
            if (propertyIndex !== undefined) {
                const arrayProperty = (ownerDescriptor.owner as any)[ownerDescriptor.propertyName] as any;
                AST.changeNamed("deleteBox", () => {
                    arrayProperty.splice(propertyIndex, 1);
                })
                const length = arrayProperty.length;
                if (length === 0) {
                    // TODO Maybe we should select the element (or leaf) just before the list.
                    this.selectElementBox(
                        parentElement,
                        role,
                    );
                } else if (length <= propertyIndex) {
                    this.selectElement(arrayProperty[propertyIndex - 1]);
                } else {
                    this.selectElement(arrayProperty[propertyIndex]);
                }
            } else {
                AST.changeNamed("deleteBox", () => {
                    ownerDescriptor.owner[ownerDescriptor.propertyName] = null;
                })
                this.selectElementBox(
                    ownerDescriptor.owner,
                    ownerDescriptor.owner.freIsBinaryExpression()
                        ? RoleProvider.binaryProperty(ownerDescriptor.propertyName)
                        : role,
                );
            }
        }    }

    /**
     * Deletes the property value in 'box',  from the model.
     * @param box          The box to be removed.
     * @param deleteParent If true, delete the parent node as well, assuming it has only one property
     */
    deleteTextBox(box: Box, deleteParent: boolean) {
        this.DELETE_PARENT = deleteParent
        LOGGER.log(`deleteTextBox  ${box.id} for property ${box.propertyName}`);
        const propertyName = box.propertyName
        const node: FreNode = box.node;
        if (node.freIsUnit()) {
            return
        }
        if (isNullOrUndefined(propertyName)) {
            LOGGER.log("  no property found")
        } else {
            let changedNode: FreNode | undefined = undefined
            AST.changeNamed( "delete text box", () => {
                changedNode = this.deletePropertyForNode(node, propertyName, box.propertyIndex, false)
            })
            // this.selectElement(changedNode)
            this.selectFirstEditableChildBox(changedNode, true)
        }
    }

    DELETE_PARENT: boolean = false
    
    private deletePropertyForNode(node: FreNode, propertyName: string, propertyIndex: number, recursive: boolean): FreNode | undefined {
        LOGGER.log(`deletePropertyForNode  ${node.freLanguageConcept()} for property ${propertyName} at index ${propertyIndex} recursive ${recursive}`);
        let changedNode: FreNode | undefined = undefined
        const propertyInfo = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName)
        const nodeInfo = FreLanguage.getInstance().classifier(node.freLanguageConcept())
        if (propertyInfo.isList && !isNullOrUndefined(propertyIndex)) {
            LOGGER.log(`    deletePropertyForNode for list ${propertyName}[${propertyIndex}]`)
            const arrayProperty = node[propertyName] as any[];
            AST.changeNamed("deleteBox", () => {
                arrayProperty.splice(propertyIndex, 1);
            })    
            return node
        } else if (propertyInfo.isList) { /// & no index goven
            LOGGER.log("    deletePropertyForNode list without index, do nothing")
            return  undefined;
        } else if (propertyInfo.propertyKind === "part") {
            LOGGER.log(`    deletePropertyForNode delete single part    `)
            AST.changeNamed("deleteBox", () => {
                node[propertyName] = null
            })
            changedNode = node
            if (!recursive && this.canBeDeleted(node, nodeInfo, propertyInfo)) {
                LOGGER.log("    deletePropertyForNode deleting parent node for " + nodeInfo.typeName)
                const ownerDescriptor: FreOwnerDescriptor = node.freOwnerDescriptor();
                if (ownerDescriptor !== null) {
                    const newChangedNode = this.deletePropertyForNode(ownerDescriptor.owner, ownerDescriptor.propertyName, ownerDescriptor.propertyIndex, true)
                    if (newChangedNode !== undefined) {
                        changedNode = newChangedNode
                    }
                }
            }
            return changedNode
        } else if (propertyInfo.propertyKind === "reference") {
            LOGGER.log(`    deletePropertyForNode delete single reference`)
            const ref = node[propertyName] as FreNodeReference<any>
            LOGGER.log(`    deletePropertyForNode emptying reference ${ref}`)
            if (!isNullOrUndefined(ref)) {
                AST.changeNamed("deleteBox", () => {
                    ref.name = ""
                })
                changedNode = undefined
            }
            if (isNullOrUndefined(ref) || (ref.name === "" || ref.name === null) && isNullOrUndefined(ref.referred)) {
                // Empty reference delete parent
                LOGGER.log(`    deletePropertyForNode Empty reference try to delete parent`)
                const ownerDescriptor: FreOwnerDescriptor = node.freOwnerDescriptor();
                if (ownerDescriptor !== null) {
                    const classifierInfo = FreLanguage.getInstance().classifier(ownerDescriptor.owner.freLanguageConcept())
                    LOGGER.log(`    deletePropertyForNode    parent is ${classifierInfo.typeName} propname ${ownerDescriptor.propertyName}`)
                    if (!recursive && this.canBeDeleted(node, nodeInfo, propertyInfo)) {
                        LOGGER.log(`   ... delete parent node, #properties is 1`)
                        const newChangedNode = this.deletePropertyForNode(ownerDescriptor.owner, ownerDescriptor.propertyName, ownerDescriptor.propertyIndex, true)
                        if (newChangedNode !== undefined) {
                            changedNode = newChangedNode
                        }
                    } else {
                        LOGGER.log(`    deletePropertyForNode    ... parent NOT remove node because it has more than one property: ${Array.from(nodeInfo.properties.keys())}`)
                    }
                }
                return changedNode
            } else {
                LOGGER.log(`    DONE deletePropertyForNode emptying reference`)
                // AST.changeNamed("deleteBox", () => {
                //     ref.name = ""
                // })
                return changedNode
            }
        } else if (propertyInfo.propertyKind === "primitive") {
            // Cannot remove property value, so see whether the node itself can be removed
            if (!recursive && this.canBeDeleted(node, nodeInfo, propertyInfo)) {
                LOGGER.log("    deletePropertyForNode deleting parent node for " + nodeInfo.typeName)
                const ownerDescriptor: FreOwnerDescriptor = node.freOwnerDescriptor();
                if (ownerDescriptor !== null) {
                    const newChangedNode = this.deletePropertyForNode(ownerDescriptor.owner, ownerDescriptor.propertyName, ownerDescriptor.propertyIndex, true)
                    if (newChangedNode !== undefined) {
                        changedNode = newChangedNode
                    }
                }
            } else {
                LOGGER.log(`    deletePropertyForNode.primitive NOT remove node because it has more than one property: ${Array.from(nodeInfo.properties.keys())}`)
            }
            return changedNode           
        }
        return changedNode
    }

    /**
     * Check whether node can be deleted
     * @param node              The node to test for deletion
     * @param classifierInfo    The info abouit t he node
     * @param propertyInfo      The info about the property where the deletion started
     * @private
     */
    private canBeDeleted(node: FreNode, classifierInfo: FreLanguageClassifier, propertyInfo: FreLanguageProperty): boolean {
        LOGGER.log(`canBeDeleted node ${node.freLanguageConcept()}  info ${classifierInfo.typeName} property ${propertyInfo.name}`)
        if (!this.DELETE_PARENT) {
            return false
        }
        const hasMandatoryProperties = Array.from(classifierInfo.properties.values()).filter(p => !p.isOptional && (p.name !== propertyInfo.name)).length >= 1
        if (hasMandatoryProperties) {
            LOGGER.log("    canBeDeleted HAS mandatory properties")
            return false
        } else {
            LOGGER.log("    canBeDeleted no mandatory properties")
            const optionalProperties = Array.from(classifierInfo.properties.values()).filter(p => p.isOptional)
            for(const prop of optionalProperties) {
                if (!this.isEmptyProperty(node[prop.name])) {
                    LOGGER.log(`    canBeDeleted optional property ${prop.name} is not empty`)
                    return false
                }
            }
        }
        return true
    }

    private isEmptyProperty(value: any): boolean {
        return isNullOrUndefined(value)
            || value === ""
            || (Array.isArray(value) && (value as []).length === 0)
            || ((value instanceof FreNodeReference) && value.name === "" && isNullOrUndefined(value.referred));
    }

    /**
     * TODO
     * @param freCustomAction
     */
    addOrReplaceAction(freCustomAction: FreAction) {
        // LOGGER.log("   addOrReplaceAction [" + triggerTypeToString(freCustomAction.trigger) + "] [" + freCustomAction.activeInBoxRoles + "]");

        // this.newFreActions.forEach(act => {
        //     LOGGER.log("   Trigger [" + triggerTypeToString(act.trigger) + "] [" + act.activeInBoxRoles + "]");
        // });
        const alreadyThere = this.newFreActions.findIndex((action) => {
            return (
                isEqual(action.trigger, freCustomAction.trigger) &&
                isEqual(action.activeInBoxRoles, freCustomAction.activeInBoxRoles)
            );
        });
        // console.log("  alreadyThere: " + alreadyThere);
        if (alreadyThere !== -1) {
            // found it
            this.newFreActions.splice(alreadyThere, 1, freCustomAction);
        } else {
            this.newFreActions.splice(0, 0, freCustomAction);
        }
    }

    /**
     * TODO
     * @param actions
     * @private
     */
    private initializeActions(actions?: FreCombinedActions) {
        if (actions === undefined || actions === null) {
            return;
        }
        actions.customActions.forEach((ca) => this.newFreActions.push(ca));
        actions.binaryExpressionActions.forEach((ca) => this.newFreActions.push(ca));
    }

    /**
     * Relays any message to the user. Function should be overridden by the webapp or any other part that is able to show
     * the message to the user.
     * @param message       The message.
     * @param severityType  The severity of the message (information, hint, warning, or error).
     */
    setUserMessage(message: string, severityType?: FreErrorSeverity) {
        console.error(
            'This message should be shown elsewhere: "' + message + '", please override this method appropriately.',
            severityType,
        );
    }

    /**
     * Sets the previous sibling of the currently selected box to be the selected box.
     * TODO what if there is no previous sibling?
     */
    selectPreviousLeaf(box?: Box) {
        if (isNullOrUndefined(box)) {
            box = this._selectedBox
        }
        const previous: Box = box?.nextLeafLeft;
        LOGGER.log("Select previous leaf is box " + previous?.role);
        if (!isNullOrUndefined(previous)) {
            if (isExpressionPreOrPost(previous)) {
                // Special expression prefix or postfix box, don't select it
                this.selectPreviousLeaf(previous);
            } else {
                this.selectElementForBox(previous, FreCaret.RIGHT_MOST);
            }
        }
    }

    /**
     * Sets the next sibling of 'box', or when 'box' is not present, the next sibling of
     * the currently selected box, to be the selected box.
     * TODO what if there is no next sibling?
     * @param box
     */
    selectNextLeaf(box?: Box) {
        if (isNullOrUndefined(box)) {
            box = this._selectedBox
        }
        const next: Box = box?.nextLeafRight;
        LOGGER.log("Select next leaf is box " + next?.role);
        if (!isNullOrUndefined(next)) {
            if (isExpressionPreOrPost(next)){
                // Special expression prefix or postfix box, don't select it
                LOGGER.log(`selectNextleaf: skipping ${next.id} ${next.kind}`)
                this.selectNextLeaf(next);
            } else {
                this.selectElementForBox(next, FreCaret.LEFT_MOST);
            }
        }
    }

    selectPreviousLeafIncludingExpressionPreOrPost(box?: Box) {
        if (isNullOrUndefined(box)) {
            box = this._selectedBox
        }
        const previous: Box = box?.nextLeafLeft;
        LOGGER.log("Select previous leaf is box " + previous?.role);
        if (!!previous) {
            this.selectElementForBox(previous, FreCaret.RIGHT_MOST);
        }
    }

    selectNextLeafIncludingExpressionPreOrPost(box?: Box) {
        if (isNullOrUndefined(box)) {
            box = this._selectedBox
        }
        const next: Box = box?.nextLeafRight;
        LOGGER.log("Select next leaf is box " + next?.role);
        if (!!next) {
            this.selectElementForBox(next, FreCaret.LEFT_MOST);
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
        // wait(0);
        const x = box.actualX + this.scrollX ;
        const y = box.actualY + this.scrollY;
        let result: Box = box.nextLeafLeft;
        let tmpResult = result;
        LOGGER.log(`boxAbove ${box.role}: ${box.kind} actual (${Math.round(x)}, ${Math.round(y)}) `);
        while (result !== null) {
            LOGGER.log(`previous: ${result.role + result.node.freId()} result (${result.actualX}, ${result.actualY}) scroll-relative (${result.actualX + this.scrollX}, ${result.actualY + this.scrollY})`);
            if (FreEditor.isOnPreviousLine(tmpResult, result) && FreEditor.isOnPreviousLine(box, tmpResult)) {
                return tmpResult;
            }
            if (FreEditor.isOnPreviousLine(box, result)) {
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
        const x = box.actualX + this.scrollX ;
        const y = box.actualY + this.scrollY;
        let result: Box = box.nextLeafRight;
        let tmpResult = result;
        LOGGER.log(`boxBelow ${box.role}: ${box.kind} ${Math.round(x)}, ${Math.round(y)} text: ${(isTextBox(box) ? box.getText() : "NotTextBox")}`);
        while (result !== null) {
            LOGGER.log(
                "next : " +
                    result.role +
                    "  " +
                    Math.round(result.actualX + this.scrollX) +
                    ", " +
                    Math.round(result.actualY + this.scrollY),
            );
            if (FreEditor.isOnNextLine(tmpResult, result) && FreEditor.isOnNextLine(box, tmpResult)) {
                LOGGER.log("Found box below 1 [" + (!!tmpResult ? tmpResult.role : "null") + "]");
                return tmpResult;
            }
            if (FreEditor.isOnNextLine(box, result)) {
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
        if (up !== null && up !== undefined) {
            this.selectElementForBox(up);
        }
    }

    /**
     * This method makes sure that for all boxes that display nodes that are in the error list,
     * the hasError setter is being called.
     * @param list
     */
    setErrors(list: FreError[]) {
        this._errorDecorator.setErrors(list);
    }
    //
    // gatherErrorsPerLine() {
    //     this._errorDecorator.gatherMessagesForGutter();
    // }
}
