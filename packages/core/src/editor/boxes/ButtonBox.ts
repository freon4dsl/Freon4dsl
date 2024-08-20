import { Box } from "./internal";
import { FreNode } from "../../ast";
import { FreLogger } from "../../logging";
import { FreUtils } from "../../util";
import { BehaviorExecutionResult } from "../util";
import { FrePostAction } from "../actions";
import { runInAction } from "mobx";
import { FreEditor } from "../FreEditor";

const LOGGER: FreLogger = new FreLogger("ButtonBox"); //.mute();

export class ButtonBox extends Box {
    readonly kind: string = "ButtonBox";
    text: string = "";

    constructor(node: FreNode, text: string, role: string, initializer?: Partial<ButtonBox>) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.text = text;
        LOGGER.log("Creating a ButtonBox");
    }

    executeAction(editor: FreEditor): BehaviorExecutionResult {
        // find the action to use based on the boxRole
        for (const action of editor.newFreActions) {
            if (action.activeInBoxRoles.includes(this.role)) {
                let postAction: FrePostAction = null;
                runInAction(() => {
                    const command = action.command();
                    postAction = command.execute(this, "no-label", editor, -1);
                });
                if (!!postAction) {
                    postAction();
                }
                return BehaviorExecutionResult.EXECUTED;
            }
        }
        // execute the action
        // return the result
        LOGGER.log("Executing ButtonBox Action");
        return BehaviorExecutionResult.NULL;
    }
}

export function isButtonBox(b: Box): b is ButtonBox {
    return b?.kind === "ButtonBox"; // b instanceof ButtonBox;
}
