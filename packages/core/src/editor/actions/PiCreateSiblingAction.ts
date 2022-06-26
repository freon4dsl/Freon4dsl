import { PiUtils } from "../../util";
import { PiLogger } from "../../logging";
import { Box } from "../boxes/index";
import { PiAction } from "./PiAction";
import { PiCommand, PiCreateSiblingCommand } from "./PiCommand";

const LOGGER = new PiLogger("PiCreateSiblingAction");

export class PiCreateSiblingAction extends PiAction {
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
        return new PiCreateSiblingCommand(this.conceptName, null);
    }
}
