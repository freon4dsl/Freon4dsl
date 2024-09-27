import { FreUtils } from "../../util/index.js";
import { FreAction, CustomAction } from "./internal.js";
import { FreCommand, FreCustomCommand } from "./FreCommand.js";
// import { FreLogger } from "../../logging";

// const LOGGER = new FreLogger("FreCustomAction");

export class FreCustomAction extends FreAction {
    static create(initializer?: Partial<FreCustomAction>) {
        const result = new FreCustomAction();
        FreUtils.initializeObject(result, initializer);
        return result;
    }
    /**
     * The action function that will be performed
     */
    action: CustomAction;

    constructor() {
        super();
    }

    command(): FreCommand {
        return new FreCustomCommand(this.action, this.boxRoleToSelect, this.caretPosition);
    }
}
