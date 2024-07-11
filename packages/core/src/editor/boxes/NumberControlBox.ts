import {FreLogger} from "../../logging";
import {FreNode} from "../../ast";
import {FreUtils} from "../../util";
import {Box} from "./Box";

const LOGGER: FreLogger = new FreLogger("NumberControlBox");

export type NumberDisplayInfo = {
    max: number | undefined;
    min: number | undefined;
    step: number| undefined;
    initialValue: number | undefined;
}
export enum NumberDisplay {
    SELECT,             // a text component
    HORIZONTAL_SLIDER,  // a slider from left to right
    VERTICAL_SLIDER,    // a slider from bottom to top
    HORIZONTAL_STEP_SLIDER,  // a slider from left to right, with discrete steps
    VERTICAL_STEP_SLIDER,    // a slider from bottom to top, with discrete steps
}

export class NumberControlBox extends Box {
    kind: string = "NumberControlBox";
    showAs: NumberDisplay = NumberDisplay.HORIZONTAL_STEP_SLIDER;
    displayInfo: NumberDisplayInfo | undefined;

    $getNumber: () => number;
    $setNumber: (newValue: number) => void;

    /**
     * Run the setNumber() as defined by the user of this box inside a mobx action.
     * @param newValue
     */
    setNumber(newValue: number): void {
        LOGGER.log("setNumber to " + newValue);
        this.$setNumber(newValue);
        this.isDirty();
    }

    getNumber(): number {
        return this.$getNumber();
    }

    constructor(node: FreNode,
                role: string,
                getNumber: () => number,
                setNumber: (newValue: number) => void,
                initializer?: Partial<NumberControlBox>
    ) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.$getNumber = getNumber;
        this.$setNumber = setNumber;
    }
}

export function isNumberControlBox(b: Box): b is NumberControlBox {
    return b?.kind === "NumberControlBox"; // b instanceof NumberControlBox;
}

