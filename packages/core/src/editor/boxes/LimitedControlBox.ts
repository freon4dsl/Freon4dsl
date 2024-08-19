import { FreLogger } from "../../logging";
import { Box } from "./internal";
import { FreNode } from "../../ast";
import { FreUtils } from "../../util";

const LOGGER: FreLogger = new FreLogger("LimitedControlBox").mute();

export enum LimitedDisplay {
    SELECT, // a dropdown menu with selections for each limited value
    RADIO_BUTTON, // a RadioButton (group) which allows only one value
    CHECKBOX, // a group of checkboxes which allows multiple values
}

export class LimitedControlBox extends Box {
    readonly kind: string = "LimitedControlBox";
    showAs: LimitedDisplay = LimitedDisplay.RADIO_BUTTON;
    /**
     * NB
     * The following two functions are used for both single valued and list values limited properties.
     * In case of a single value, only the 0-th element is used.
     */
    $getNames: () => string[];
    $setNames: (newValue: string[]) => void;
    possibleNames: string[] = [];

    /**
     * Run the setBoolean() as defined by the user of this box inside a mobx action.
     * @param newValue
     */
    setNames(newValue: string[]): void {
        LOGGER.log("set Limited to " + newValue);
        this.$setNames(newValue);
        this.isDirty();
    }

    getNames(): string[] {
        // console.log("LimitedControlBox.getNames() current value is " + this.$getNames());
        return this.$getNames();
    }

    getPossibleNames(): string[] {
        return this.possibleNames;
    }

    constructor(
        node: FreNode,
        role: string,
        getValues: () => string[],
        setValues: (newValue: string[]) => void,
        possibleValues: string[],
        initializer?: Partial<LimitedControlBox>,
    ) {
        super(node, role);
        // console.log("Created limited box: [" + possibleValues + "]")
        FreUtils.initializeObject(this, initializer);
        this.$getNames = getValues;
        this.$setNames = setValues;
        this.possibleNames = possibleValues;
        // console.log("LimitedControlBox.constructor current value is " + this.$getNames());
    }
}

export function isLimitedControlBox(b: Box): b is LimitedControlBox {
    return b?.kind === "LimitedControlBox"; // b instanceof LimitedControlBox;
}
