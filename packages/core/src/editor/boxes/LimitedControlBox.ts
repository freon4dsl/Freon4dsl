import {FreLogger} from "../../logging";
import {Box} from "./Box";
import {FreNode} from "../../ast";
import {FreUtils} from "../../util";

const LOGGER: FreLogger = new FreLogger("LimitedControlBox").mute();

export enum LimitedDisplay {
    SELECT,         // a dropdown menu with selections for each limited value
    RADIO_BUTTON,   // a RadioButton (group) which allows only one value
    CHECKBOX_GROUP  // a group of checkboxes which allows multiple values
}

export class LimitedControlBox extends Box {
    kind: string = "LimitedControlBox";
    showAs: LimitedDisplay = LimitedDisplay.RADIO_BUTTON;
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

    constructor(node: FreNode,
                role: string,
                getBoolean: () => boolean,
                setBoolean: (newValue: boolean) => void,
                initializer?: Partial<LimitedControlBox>
    ) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.$getBoolean = getBoolean;
        this.$setBoolean = setBoolean;
    }
}

export function isLimitedControlBox(b: Box): b is LimitedControlBox {
    return b?.kind === "LimitedControlBox"; // b instanceof LimitedControlBox;
}
