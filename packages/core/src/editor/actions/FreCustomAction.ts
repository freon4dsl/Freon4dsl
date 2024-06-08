import { FreUtils } from "../../util";
import { Box } from "../boxes";
import { FreAction, CustomAction } from "./internal";
import { FreCommand, FreCustomCommand } from "./FreCommand";
// import { FreLogger } from "../../logging";

// const LOGGER = new FreLogger("FreCustomAction");

export class FreCustomAction extends FreAction {

    static create(initializer?: Partial<FreCustomAction>) {
        const result = new FreCustomAction();
        FreUtils.initializeObject(result, initializer);
        return result;
    }
    /**
     * The action function taht will be performed
     */
    action: CustomAction;

    constructor() {
        super();
    }

    command(box: Box): FreCommand {
        return new FreCustomCommand(this.action, this.boxRoleToSelect, this.caretPosition);
    }
}
