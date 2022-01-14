import { runInAction } from "mobx";
import { PiElement } from "../../language/index";
import { Language } from "../../storage/index";
import { PiLogger, PiUtils } from "../../util/index";
import { Box } from "../boxes/index";
import { isString } from "../PiAction";
import { PiEditor } from "../PiEditor";
import { PiAction, PiPostAction, PiActionTriggerType, PiActionTrigger } from "./PiAction";
import { PiCommand, PiCreatePartCommand } from "./PiCommand";
import { PiCreatePartAction } from "./PiCreatePartAction";

const LOGGER = new PiLogger("PiCreateSiblingAction");

export class PiCreateSiblingAction extends PiAction {
    // propertyName: string;
    /**
     * The concept that should be created for the new element.
     * This concept should be of a type accepted by the property where the element lof the box (see execute)
     * is stored.
     */
    conceptName: string;

    constructor(initializer?: Partial<PiCreateSiblingAction>) {
        super();
        PiUtils.initializeObject(this, initializer);
    }

    command(box: Box): PiCommand {
        const container = box.element.piContainer();
        return new PiCreatePartCommand(container.propertyName, this.conceptName, container.propertyIndex, this.referenceShortcut);
    }

    /**
     * Create a new element of type `conceptName`,
     * Store this element in the same property as `box.element`.
     * @param box
     * @param text
     * @param editor
     */
    execute(box: Box, text: PiActionTrigger, editor: PiEditor): PiPostAction {
        const self = this;
        const element = box.element;
        const proc = element.piContainer();
        const parent: PiElement = proc.container;
        LOGGER.log("parent is of type " + parent?.piLanguageConcept() + "  box is " + box.kind + " role " + box.role);
        PiUtils.CHECK(parent[proc.propertyName][proc.propertyIndex] === element);
        const newElement: PiElement = Language.getInstance().concept(self.conceptName)?.constructor()
        // const newElement: PiElement = elementBuilder();
        LOGGER.log("newElement is of type " + newElement?.piLanguageConcept());
        if( newElement === undefined || newElement === null) {
            // TODO Find out why this happens sometimes
            LOGGER.log("IN BETWEEN GRID: Unexpected new element undefined");
            return null;
        }
        LOGGER.log("KEYBOARD START")
        runInAction( () => {
            parent[proc.propertyName].splice(proc.propertyIndex + 1, 0, newElement);
        });
        LOGGER.log("KEYBOARD END");
        
        return function() {
            editor.selectElement(newElement);
            editor.selectFirstEditableChildBox();
        };
    }

    undo(box: Box, editor: PiEditor): void {

    }

}
