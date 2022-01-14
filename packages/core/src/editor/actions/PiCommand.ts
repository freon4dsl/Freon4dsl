import { PiBinaryExpression, PiElement } from "../../language/index";
import { Language } from "../../storage/index";
import { BTREE, PiCaret, PiCaretPosition } from "../../util/index";
import { Box } from "../boxes/index";
import { isString } from "../PiAction";
import { PiEditor } from "../PiEditor";
import {
    CustomAction,
    EMPTY_FUNCTION,
    PiAction,
    PiActionTrigger,
    PiPostAction,
    ReferenceShortcut2,
    triggerToString2
} from "./PiAction";

export abstract class PiCommand {

    constructor() {}

    /**
     * Executes the action, should contain all model chnaages for this action.
     * Returns a function that should be executed after the projection has been calculated as a result
     * of the changes by `execute`.  Otherwise boxes and/or element that need to selected will not be available.
     * @param action The action that invokes this command.
     * @param box    The box that is selected when imvoking this command.
     * @param text   The text or keyboard shortcut or menu that invoked this command.
     * @param editor The editor instance in which this command is invoked.
     */
    abstract execute(box: Box, text: PiActionTrigger, editor: PiEditor): PiPostAction;

    abstract undo(box: Box, editor: PiEditor): void;
}

class PiNullCommand extends PiCommand {
    execute(box: Box, text: PiActionTrigger, editor: PiEditor): PiPostAction {
        return null;
    }

    undo(box: Box, editor: PiEditor): void {}
}

export const PI_NULL_COMMAND: PiCommand = new PiNullCommand();


export class PiCreatePartCommand extends PiCommand {
    propertyName: string;
    conceptName: string;
    referenceShortcut: ReferenceShortcut2;

    constructor(propertyName: string, conceptName: string, index: number, referenceShortcut: ReferenceShortcut2) {
        super();
        this.propertyName = propertyName;
        this.conceptName = conceptName
        this.referenceShortcut = referenceShortcut;
    }
    execute(box: Box, trigger: PiActionTrigger , editor: PiEditor): PiPostAction {
        console.log("CreatePartCommand: trigger [" + triggerToString2(trigger) + "] part: " + this.conceptName + " in " + this.propertyName + " refshort " + this.referenceShortcut);
        const newElement: PiElement = Language.getInstance().concept(this.conceptName)?.constructor()
        if (newElement === undefined || newElement === null) {
            // TODO Find out why this happens sometimes
            console.error("AliasBox action: Unexpected new element undefined");
            return EMPTY_FUNCTION;
        }
        if (Language.getInstance().classifierProperty(box.element.piLanguageConcept(), this.propertyName).isList) {
            box.element[this.propertyName].push(newElement);
        } else {
            box.element[this.propertyName] = newElement;
        }
        if (!!trigger && isString(trigger) && !!this.referenceShortcut) {
            newElement[this.referenceShortcut.propertyname] = Language.getInstance().referenceCreator(trigger, this.referenceShortcut.metatype);
        }

        return function() {
            editor.selectElement(newElement);
            editor.selectFirstEditableChildBox();
        }
    }

    undo(box: Box, editor: PiEditor) {
    }
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

    execute(box: Box, trigger: PiActionTrigger, editor: PiEditor): PiPostAction {
        console.log("PiCreateBinaryExpressionCommand: trigger [" + triggerToString2(trigger) + "] part: ");
        // LOGGER.log("execute binary expression alias ok");
        const selected = BTREE.insertBinaryExpression(this.expressionBuilder(box, triggerToString2(trigger), editor), box, editor);
        const self = this;
        return function () {
            editor.selectElement(selected.element, self.boxRoleToSelect, self.caretPosition);
        }
    }

    undo() {
   }
}

export class PiCustomCommand extends PiCommand {
    boxRoleToSelect: string;
    caretPosition: PiCaretPosition;
    action: CustomAction;

    constructor(action: CustomAction) {
        super();
        this.action = action;
    }

    execute(box: Box, trigger: PiActionTrigger, editor: PiEditor): PiPostAction {
        // LOGGER.log("execute custom action, text is [" + text + "] refShort [" + this.referenceShortcut + "]" );
        console.log("PiCustomCommand: trigger [" + triggerToString2(trigger) + "]");
        const selected = this.action(box, triggerToString2(trigger), editor);

        if (!!selected) {
            return function() {
                editor.selectElement(selected, this.boxRoleToSelect, this.caretPosition);
            }
        }
        return EMPTY_FUNCTION;
    }

    undo() {
    }
}
