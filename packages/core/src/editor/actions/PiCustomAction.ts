import { PiLogger, PiUtils } from "../../util/index";
import { Box } from "../boxes/index";
import { PiAction, CustomAction } from "./internal";
import { PiCommand, PiCustomCommand } from "./PiCommand";

const LOGGER = new PiLogger("PiCustomAction");

export class PiCustomAction extends PiAction {
    /**
     * The action function taht will be performed
     */
    action: CustomAction;

    static create(initializer?: Partial<PiCustomAction>) {
        const result = new PiCustomAction();
        PiUtils.initializeObject(result, initializer);
        return result;
    }

    constructor() {
        super();
    }

    command(box: Box): PiCommand {
        return new PiCustomCommand(this.action, this.boxRoleToSelect);
    }
}
