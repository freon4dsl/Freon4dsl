import { PiBinaryExpression, PiElement } from "../../ast";
import { Language } from "../../language";
import { BTREE, PiCaret, PiCaretPosition } from "../../util";
import { Box } from "../boxes";
import { PiEditor } from "../PiEditor";
import { CustomAction, EMPTY_POST_ACTION, PiPostAction, ReferenceShortcut } from "./PiAction";
import { isString, PiTriggerUse, triggerTypeToString } from "./PiTriggers";

/**
 * Abstract supercass for all commands in ProjectIt.
 * PiCommand is the only place where actual changes (coming from the editor) to the model should be made.
 *
 * The `undo()` function is not always implemented yet.
 */
export abstract class PiCommand {
    constructor() {}

    /**
     * Executes the action, should contain all model changes for this action.
     * Returns a function that should be executed after the projection has been calculated as a result
     * of the changes by `execute`. Otherwise, boxes and/or element that need to selected will not be available.
     * @param box    The box that is selected when imvoking this command.
     * @param text   The text or keyboard shortcut or menu that invoked this command.
     * @param editor The editor instance in which this command is invoked.
     */
    abstract execute(box: Box, text: PiTriggerUse, editor: PiEditor): PiPostAction;

    /**
     * Undo this command.
     * The assumption is that this will be done on the model in the state directly after executing this command.
     * If this is not the case, the undo might give unexpected results.
     * By keeping all executed commands on a stack, undo can be realized for multiple commands.
     *
     * @param box
     * @param editor
     */
    abstract undo(box: Box, editor: PiEditor): void;
}

class PiNullCommand extends PiCommand {
    execute(box: Box, text: PiTriggerUse, editor: PiEditor): PiPostAction {
        return EMPTY_POST_ACTION;
    }

    undo(box: Box, editor: PiEditor): void {}
}

export const PI_NULL_COMMAND: PiCommand = new PiNullCommand();

/**
 * Command to create a part (child) of a PiElement.
 * The PiElement of the box on which this command is executed shpould have a property with `propertyName` of
 * type `conceptName`.
 */
export class PiCreatePartCommand extends PiCommand {
    /**
     * The name of the property in which the created element will be stored.
     */
    propertyName: string;

    /**
     * The name of the concept that will be created.
     */
    conceptName: string;
    referenceShortcut: ReferenceShortcut;

    constructor(propertyName: string, conceptName: string, index: number, referenceShortcut: ReferenceShortcut) {
        super();
        this.propertyName = propertyName;
        this.conceptName = conceptName;
        this.referenceShortcut = referenceShortcut;
        console.log("+++++++++++++++ Create part command " + propertyName + ", " + conceptName);
    }

    execute(box: Box, trigger: PiTriggerUse, editor: PiEditor): PiPostAction {
        console.log(
            "CreatePartCommand: trigger [" +
                triggerTypeToString(trigger) +
                "] part: " +
                this.conceptName +
                " in " +
                this.propertyName +
                " refshort " +
                this.referenceShortcut
        );
        const newElement: PiElement = Language.getInstance().concept(this.conceptName)?.constructor();
        if (newElement === undefined || newElement === null) {
            // TODO Find out why this happens sometimes
            console.error("AliasBox action: Unexpected new element undefined");
            return EMPTY_POST_ACTION;
        }
        if (Language.getInstance().classifierProperty(box.element.piLanguageConcept(), this.propertyName).isList) {
            box.element[this.propertyName].push(newElement);
        } else {
            box.element[this.propertyName] = newElement;
        }
        if (!!trigger && isString(trigger) && !!this.referenceShortcut) {
            newElement[this.referenceShortcut.propertyName] = Language.getInstance().referenceCreator(trigger, this.referenceShortcut.conceptName);
        }

        return function () {
            editor.selectElement(newElement);
            editor.selectFirstEditableChildBox();
        };
    }

    undo(box: Box, editor: PiEditor) {}
}

export class PiCreateSiblingCommand extends PiCommand {
    conceptName: string;
    referenceShortcut: ReferenceShortcut;
    boxRoleToSelect: string;

    constructor(conceptName: string, referenceShortcut: ReferenceShortcut, boxRoleToSelect?: string) {
        super();
        this.conceptName = conceptName;
        this.referenceShortcut = referenceShortcut;
        this.boxRoleToSelect = boxRoleToSelect;
    }

    execute(box: Box, trigger: PiTriggerUse, editor: PiEditor): PiPostAction {
        console.log("CreateSiblingCommand: trigger [" + triggerTypeToString(trigger) + "] part: " + this.conceptName + " refshort " + this.referenceShortcut);
        const newElement: PiElement = Language.getInstance().concept(this.conceptName)?.constructor();
        if (newElement === undefined || newElement === null) {
            // TODO Find out why this happens sometimes
            console.error("PiCreateSiblingCommand: Unexpected new element undefined");
            return EMPTY_POST_ACTION;
        }
        const ownerDescriptor = box.element.piOwnerDescriptor();
        if (Language.getInstance().classifierProperty(ownerDescriptor.owner.piLanguageConcept(), ownerDescriptor.propertyName).isList) {
            ownerDescriptor.owner[ownerDescriptor.propertyName].splice(ownerDescriptor.propertyIndex + 1, 0, newElement);
        } else {
            ownerDescriptor.owner[ownerDescriptor.propertyName] = newElement;
        }
        if (!!trigger && isString(trigger) && !!this.referenceShortcut) {
            newElement[this.referenceShortcut.propertyName] = Language.getInstance().referenceCreator(trigger, this.referenceShortcut.conceptName);
        }
        const self = this;
        if (!!this.boxRoleToSelect) {
            return function () {
                editor.selectElement(newElement, self.boxRoleToSelect);
            };
        } else {
            return function () {
                editor.selectElement(newElement);
                editor.selectFirstEditableChildBox();
            };
        }
    }

    undo(box: Box, editor: PiEditor) {}
}

export type PiBinaryExpressionBuilder = (box: Box, text: string, editor: PiEditor) => PiBinaryExpression;

export class PiCreateBinaryExpressionCommand extends PiCommand {
    expressionBuilder: PiBinaryExpressionBuilder;
    boxRoleToSelect: string;
    caretPosition: PiCaret;

    constructor(expressionBuilder: PiBinaryExpressionBuilder) {
        super();
        this.expressionBuilder = expressionBuilder;
    }

    execute(box: Box, trigger: PiTriggerUse, editor: PiEditor): PiPostAction {
        console.log("PiCreateBinaryExpressionCommand: trigger [" + triggerTypeToString(trigger) + "] part: ");
        const selected = BTREE.insertBinaryExpression(this.expressionBuilder(box, triggerTypeToString(trigger), editor), box, editor);
        return function () {
            editor.selectElement(selected.element, selected.boxRoleToSelect)
        };
    }

    undo() {}
}

export class PiCustomCommand extends PiCommand {
    boxRoleToSelect: string;
    caretPosition: PiCaretPosition;
    action: CustomAction;

    constructor(action: CustomAction, boxRoleToSelect) {
        super();
        this.action = action;
        this.boxRoleToSelect = boxRoleToSelect;
    }

    execute(box: Box, trigger: PiTriggerUse, editor: PiEditor): PiPostAction {
        // LOGGER.log("execute custom action, text is [" + text + "] refShort [" + this.referenceShortcut + "]" );
        console.log("PiCustomCommand: trigger [" + triggerTypeToString(trigger) + "]");
        const self = this;
        const selected = self.action(box, triggerTypeToString(trigger), editor);

        if (!!selected) {
            if (!!self.boxRoleToSelect) {
                return function () {
                    console.log("PiCommand select " + box.element.piLanguageConcept() + " box " + self.boxRoleToSelect);
                    editor.selectElement(selected, self.boxRoleToSelect);
                };
            } else {
                // Default: select the first editable child of the selected element
                return function () {
                    editor.selectElement(selected);
                    editor.selectFirstEditableChildBox();
                };
            }
        }
        return EMPTY_POST_ACTION;
    }

    undo() {}
}
