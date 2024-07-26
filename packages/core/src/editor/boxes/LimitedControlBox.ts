import {FreLogger} from "../../logging";
import {Box} from "./internal";
import {FreNode} from "../../ast";
import {FreUtils} from "../../util";

// TODO This Box and its component are not used yet, first we need to include more info on limited concepts into the language information
const LOGGER: FreLogger = new FreLogger("LimitedControlBox").mute();

export enum LimitedDisplay {
    SELECT,         // a dropdown menu with selections for each limited value
    RADIO_BUTTON,   // a RadioButton (group) which allows only one value
    CHECKBOX_GROUP  // a group of checkboxes which allows multiple values
}

export class LimitedControlBox extends Box {
    kind: string = "LimitedControlBox";
    showAs: LimitedDisplay = LimitedDisplay.RADIO_BUTTON;
    $getNames: () => string[];
    $setNames: (newValue: string[]) => void;
    possibleNames: string[] = [];

    /**
     * Run the setBoolean() as defined by the user of this box inside a mobx action.
     * @param newValue
     */
    setNames(newValue: string[]): void {
        LOGGER.log("setBoolean to " + newValue);
        this.$setNames(newValue);
        this.isDirty();
    }

    getNames(): string[] {
        return this.$getNames();
    }

    getPossibleNames(): string[] {
        return this.$getNames();
    }

    constructor(node: FreNode,
                role: string,
                getValues: () => string[],
                setValues: (newValue: string[]) => void,
                possibleValues: string[],
                initializer?: Partial<LimitedControlBox>
    ) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.$getNames = getValues;
        this.$setNames = setValues;
        this.possibleNames = possibleValues;
    }
}

export function isLimitedControlBox(b: Box): b is LimitedControlBox {
    return b?.kind === "LimitedControlBox"; // b instanceof LimitedControlBox;
}
