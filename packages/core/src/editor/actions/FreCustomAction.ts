import { FreUtils } from "../../util";
import { FreLogger } from "../../logging";
import { Box } from "../boxes/index";
import { FreAction, CustomAction } from "./internal";
import { FreCommand, FreCustomCommand } from "./FreCommand";

const LOGGER = new FreLogger("FreCustomAction");

export class FreCustomAction extends FreAction {
    /**
     * The action function taht will be performed
     */
    action: CustomAction;

    static create(initializer?: Partial<FreCustomAction>) {
        const result = new FreCustomAction();
        FreUtils.initializeObject(result, initializer);
        return result;
    }

    constructor() {
        super();
    }

    command(box: Box): FreCommand {
        return new FreCustomCommand(this.action, this.boxRoleToSelect);
    }
}
