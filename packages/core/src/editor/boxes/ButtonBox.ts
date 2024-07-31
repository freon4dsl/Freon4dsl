import {Box} from "./internal";
import {FreNode} from "../../ast";
import {FreLogger} from "../../logging";
import {FreUtils} from "../../util";
import {BehaviorExecutionResult} from "../util";

const LOGGER: FreLogger = new FreLogger("ButtonBox").mute();

export class ButtonBox extends Box {
    readonly kind: string = "ButtonBox";
    text: string = "BUTTON";

    constructor(node: FreNode,
                text: string,
                role: string,
                initializer?: Partial<ButtonBox>
    ) {
        super(node, role);
        this.text = text;
        FreUtils.initializeObject(this, initializer);
        LOGGER.log("Creating a ButtonBox");
    }

    executeAction():BehaviorExecutionResult {
        // find the action to use based on the boxRole
        // execute the action
        // return the result
        LOGGER.log("Executing ButtonBox Action");
        return BehaviorExecutionResult.NULL;
    }
}

export function isButtonBox(b: Box): b is ButtonBox {
    return b?.kind === "ButtonBox"; // b instanceof ButtonBox;
}
