import { Box } from "./Box";
import {FreNode} from "../../ast";
import {FreLogger} from "../../logging";
import {FreUtils} from "../../util";
import {FreEditor} from "../FreEditor";
import {SelectOption} from "./SelectOption";
import {BehaviorExecutionResult} from "../util";

const LOGGER: FreLogger = new FreLogger("BooleanBox");

export enum BoolDisplay {
    SELECT,         // a dropdown menu with selections for True and False
    CHECKBOX,       // a Checkbox that can be toggled
    RADIO_BUTTON,   // a RadioButton with two options: True and False
    SWITCH,         // an ordinary, sliding Switch that can be turned on and off
    INNER_SWITCH,   // a Switch, shown within a box, with labels, that can be turned on and off
}

export class BooleanBox extends Box {
    kind: string = "BooleanBox";
    showAs: BoolDisplay = BoolDisplay.RADIO_BUTTON;
    // placeholder, labels and selectOption are only used in the SELECT display
    placeHolder: string = "";
    labels: { yes: string; no: string } = { yes: "true", no: "false" }
    $selectOption: (editor: FreEditor, option: SelectOption) => BehaviorExecutionResult
    //
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
                initializer?: Partial<BooleanBox>,
                selectOption?: (editor: FreEditor, option: SelectOption) => BehaviorExecutionResult
    ) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.$getBoolean = getBoolean;
        this.$setBoolean = setBoolean;
        this.$selectOption = selectOption;
    }
}

export function isBooleanBox(b: Box): b is BooleanBox {
    return b?.kind === "BooleanBox"; // b instanceof BooleanBox;
}
