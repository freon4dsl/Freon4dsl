import { PiLogger, PiUtils } from "../../util/index";
import { Box } from "../boxes/index";
import { PiAction, CustomAction } from "./internal";
import { PiCommand, PiCustomCommand } from "./PiCommand";

const LOGGER = new PiLogger("PiCustomAction");

export class PiCustomAction extends PiAction {
    action: CustomAction;

    constructor(initializer?: Partial<PiCustomAction>) {
        super();
        PiUtils.initializeObject(this, initializer);
    }

    command(box: Box): PiCommand {
        return new PiCustomCommand(this.action);
    }
}
