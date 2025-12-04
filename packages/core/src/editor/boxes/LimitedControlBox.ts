import { AST } from "../../change-manager/index.js";
import { FreLogger } from "../../logging/index.js";
import { Box } from "./internal.js";
import type { FreNode } from "../../ast/index.js";
import { FreUtils } from "../../util/index.js";

const LOGGER: FreLogger = new FreLogger("LimitedControlBox").mute();

export enum LimitedDisplay {
    SELECT, // a dropdown menu with selections for each limited value
    RADIO_BUTTON, // a RadioButton (group) which allows only one value
    CHECKBOX, // a group of checkboxes which allows multiple values
}

export class LimitedControlBox extends Box {
    readonly kind: string = "LimitedControlBox";
    showAs: LimitedDisplay = LimitedDisplay.RADIO_BUTTON;
    horizontal: boolean = false; // todo expose horizontal/vertical to user through the .edit file
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
        LOGGER.log("setNames Limited to " + newValue);
        AST.changeNamed("LimitedControlBox.setNames", () => {
            this.$setNames(newValue);
        })
        this.isDirty();
    }

    getNames(): string[] {
        // LOGGER.log("getNames() current value is " + this.$getNames());
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
