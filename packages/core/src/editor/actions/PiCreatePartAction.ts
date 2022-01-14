import { runInAction } from "mobx";
import { PiElement } from "../../language/index";
import { Language } from "../../storage/index";
import { PiLogger, PiUtils } from "../../util/index";
import { Box } from "../boxes/index";
import { isString } from "../PiAction";
import { PiEditor } from "../PiEditor";
import {
    EMPTY_FUNCTION,
    PiAction,
    PiPostAction,
    PiActionTriggerType,
    PiActionTrigger
} from "./PiAction";
import { PiCommand, PiCreatePartCommand } from "./PiCommand";

const LOGGER = new PiLogger("PiCreateElementAction");

export class PiCreatePartAction extends PiAction {
    /**
     * The property in which the new element should be stored.
     */
    propertyName: string;
    /**
     * The concept that should be created for the new element.
     * This concept should be of a type accepted by the property type of the `propertyName`.
     */
    conceptName: string;

    constructor(initializer?: Partial<PiCreatePartAction>) {
        super();
        PiUtils.initializeObject(this, initializer);
    }

    execute(box: Box, trigger: PiActionTrigger , editor: PiEditor): PiPostAction {
        const self = this;
        LOGGER.log("execute: " + self.propertyName + " concept " + self.conceptName);
        const newElement: PiElement = Language.getInstance().concept(self.conceptName)?.constructor()
        if (newElement === undefined || newElement === null) {
            // TODO Find out why this happens sometimes
            console.error("AliasBox action: Unexpected new element undefined");
            return EMPTY_FUNCTION;
        }
        if (Language.getInstance().classifierProperty(box.element.piLanguageConcept(), self.propertyName).isList) {
            box.element[self.propertyName].push(newElement);
        } else {
            box.element[self.propertyName] = newElement;
        }
        if (!!trigger && isString(trigger) && !!this.referenceShortcut) {
            newElement[this.referenceShortcut.propertyname] = Language.getInstance().referenceCreator(trigger, this.referenceShortcut.metatype);
        }

        return function() {
            editor.selectElement(newElement);
            editor.selectFirstEditableChildBox();
        }

    }

    undo(box: Box, editor: PiEditor): void {
    }

    command(box: Box): PiCommand {
        return new PiCreatePartCommand(this.propertyName, this.conceptName, Number.MAX_VALUE, this.referenceShortcut);
    }

}
