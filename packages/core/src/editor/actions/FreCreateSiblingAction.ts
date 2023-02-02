import { FreUtils } from "../../util";
import { FreLogger } from "../../logging";
import { Box } from "../boxes/index";
import { FreAction } from "./FreAction";
import { FreCommand } from "./FreCommand";
import { FreCreateSiblingCommand } from "./FreCreateSiblingCommand";

const LOGGER = new FreLogger("FreCreateSiblingAction");

export class FreCreateSiblingAction extends FreAction {
    /**
     * The concept that should be created for the new element.
     * This concept should be of a type accepted by the property where the element lof the box (see execute)
     * is stored.
     */
    conceptName: string;

    constructor(initializer?: Partial<FreCreateSiblingAction>) {
        super();
        FreUtils.initializeObject(this, initializer);
    }

    command(box: Box): FreCommand {
        return new FreCreateSiblingCommand(this.conceptName, null);
    }
}
