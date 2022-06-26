import { PiUtils } from "../../util";
import { PiLogger } from "../../logging";
import { Box } from "../boxes/index";
import { PiAction } from "./PiAction";
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

    command(box: Box): PiCommand {
        return new PiCreatePartCommand(this.propertyName, this.conceptName, Number.MAX_VALUE, this.referenceShortcut);
    }
}
