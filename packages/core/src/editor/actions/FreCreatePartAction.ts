import { FreUtils } from "../../util";
import { FreAction } from "./FreAction";
import { FreCommand } from "./FreCommand";
import { FreCreatePartCommand } from "./FreCreatePartCommand";

// import { FreLogger } from "../../logging";
// const LOGGER = new FreLogger("FreCreateElementAction");

export class FreCreatePartAction extends FreAction {
    /**
     * The property in which the new element should be stored.
     */
    propertyName: string;
    /**
     * The concept that should be created for the new element.
     * This concept should be of a type accepted by the property type of the `propertyName`.
     */
    conceptName: string;

    constructor(initializer?: Partial<FreCreatePartAction>) {
        super();
        FreUtils.initializeObject(this, initializer);
    }

    command(): FreCommand {
        return new FreCreatePartCommand(this.propertyName, this.conceptName, this.referenceShortcut);
    }
}
