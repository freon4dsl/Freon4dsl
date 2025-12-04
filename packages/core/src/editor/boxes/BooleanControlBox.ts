import { AST } from "../../change-manager/index.js";
import { Box } from "./internal.js";
import type { FreNode } from "../../ast/index.js";
import { FreLogger } from "../../logging/index.js";
import { FreUtils } from "../../util/index.js";

const LOGGER: FreLogger = new FreLogger("BooleanControlBox").mute();

export enum BoolDisplay {
    SELECT, // a dropdown menu with selections for True and False
    CHECKBOX, // a Checkbox that can be toggled
    RADIO_BUTTON, // a RadioButton with two options: True and False
    SWITCH, // an ordinary, sliding Switch that can be turned on and off
    INNER_SWITCH, // a Switch, shown within a box, with labels, that can be turned on and off
}

export class BooleanControlBox extends Box {
    readonly kind: string = "BooleanControlBox";
    showAs: BoolDisplay = BoolDisplay.RADIO_BUTTON;
    horizontal: boolean = false; // todo expose horizontal/vertical to user through the .edit file
    labels: { yes: string; no: string, unknown?: string } = { yes: "true", no: "false", unknown: "unknown" };
    $getBoolean: () => boolean| undefined;
    $setBoolean: (newValue: boolean| undefined) => void;

    /**
     * Run the setBoolean() as defined by the user of this box inside a mobx action.
     * @param newValue
     */
    setBoolean(newValue: boolean | undefined): void {
        LOGGER.log(`setBoolean to '${newValue}' isUndefined: ${newValue === undefined}  typeof: ${typeof newValue}` );
        AST.changeNamed("BooleanControlBox.setBoolean", () => {
            this.$setBoolean(newValue);
        })
        this.isDirty();
    }

    getBoolean(): boolean | undefined {
        return this.$getBoolean();
    }

    constructor(
        node: FreNode,
        role: string,
        getBoolean: () => boolean| undefined,
        setBoolean: (newValue: boolean| undefined) => void,
        initializer?: Partial<BooleanControlBox>,
    ) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.$getBoolean = getBoolean;
        this.$setBoolean = setBoolean;
    }
}

export function isBooleanControlBox(b: Box): b is BooleanControlBox {
    return b?.kind === "BooleanControlBox"; // b instanceof BooleanControlBox;
}
