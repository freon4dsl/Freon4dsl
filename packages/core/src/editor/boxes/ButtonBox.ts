import { AST } from "../../change-manager/index.js";
import { Box } from "./internal.js";
import type { FreNode } from "../../ast/index.js";
import { FreLogger } from "../../logging/index.js";
import { FreUtils } from "../../util/index.js";
import { BehaviorExecutionResult } from "../util/index.js";
import type { FrePostAction } from "../actions/index.js";
import type { FreEditor } from "../FreEditor.js";

const LOGGER: FreLogger = new FreLogger("ButtonBox").mute();

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
                // execute the action
                let postAction: FrePostAction = null;
                AST.changeNamed("ButtonBox.executeAction", () => {
                    postAction = action.execute(this, "no-label", editor, -1);
                });
                if (!!postAction) {
                    postAction();
                }
                return BehaviorExecutionResult.EXECUTED;
            }
        }
        // return the result
        LOGGER.log("Executing ButtonBox Action");
        return BehaviorExecutionResult.NULL;
    }
}

export function isButtonBox(b: Box): b is ButtonBox {
    return b?.kind === "ButtonBox"; // b instanceof ButtonBox;
}
