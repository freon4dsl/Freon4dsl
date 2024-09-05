import { Box } from "./internal";
import { FreNode } from "../../ast";
import { FreLogger } from "../../logging";
import { FreUtils } from "../../util";

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
    labels: { yes: string; no: string } = { yes: "true", no: "false" };
    $getBoolean: () => boolean;
    $setBoolean: (newValue: boolean) => void;

    /**
     * Run the setBoolean() as defined by the user of this box inside a mobx action.
     * @param newValue
     */
    setBoolean(newValue: boolean): void {
        LOGGER.log("setBoolean to " + newValue);
        this.$setBoolean(newValue);
        this.isDirty();
    }

    getBoolean(): boolean {
        return this.$getBoolean();
    }

    constructor(
        node: FreNode,
        role: string,
        getBoolean: () => boolean,
        setBoolean: (newValue: boolean) => void,
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
