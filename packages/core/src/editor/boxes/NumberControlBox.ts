import { FreLogger } from "../../logging";
import { FreNode } from "../../ast";
import { FreUtils, isNullOrUndefined } from "../../util";
import { Box } from "./internal";

const LOGGER: FreLogger = new FreLogger("NumberControlBox");

export type NumberDisplayInfo = {
    max?: number | undefined;
    min?: number | undefined;
    step?: number | undefined;
    showMarks?: boolean | undefined;
    discrete?: boolean | undefined;
};
export enum NumberDisplay {
    SELECT, // a text component
    SLIDER, // a slider from left to right
}

export class NumberControlBox extends Box {
    readonly kind: string = "NumberControlBox";
    showAs: NumberDisplay = NumberDisplay.SLIDER;
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
        if (this.showAs === NumberDisplay.SLIDER && newValue > this.displayInfo.max) {
            this.displayInfo.max = newValue;
            console.log("NumberBox: value greater than max");
        }
        this.isDirty();
    }

    getNumber(): number {
        return this.$getNumber();
    }

    constructor(
        node: FreNode,
        role: string,
        getNumber: () => number,
        setNumber: (newValue: number) => void,
        initializer?: Partial<NumberControlBox>,
    ) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.$getNumber = getNumber;
        this.$setNumber = setNumber;
        if (this.showAs === NumberDisplay.SLIDER) {
            this.completeDisplayInfo(getNumber());
        }
    }

    /**
     * Completes the display info with default values
     * @private
     */
    public completeDisplayInfo(currentValue: number): void {
        // check the current value, min must be equal or lower
        let myMin: number = 0;
        if (currentValue < myMin) {
            myMin = currentValue;
        }
        // check the current value, max must be equal or higher
        let myMax: number = 100;
        if (currentValue > myMax) {
            myMax = currentValue;
        }
        // check min < max
        if (myMin > myMax) {
            myMax = 10 * myMin;
        }
        // check the current value, step must be a valid divider
        let myStep: number = 1;
        let myDiscrete: boolean = true;
        let myShowMarks: boolean = false;
        if (currentValue % myStep !== 0) {
            console.log("Step not valid divider, step: " + myStep + ", value: " + currentValue);
            myStep = undefined;
            myDiscrete = false;
            myShowMarks = false;
        }

        if (isNullOrUndefined(this.displayInfo)) {
            this.displayInfo = {
                min: myMin,
                max: myMax,
                step: myStep,
                showMarks: myShowMarks,
                discrete: myDiscrete,
            };
        } else {
            if (this.displayInfo.min === undefined) {
                this.displayInfo.min = myMin;
            } else {
                // if present, check the current value, min must be equal or lower
                if (currentValue < this.displayInfo.min) {
                    this.displayInfo.min = currentValue;
                }
            }
            if (this.displayInfo.max === undefined) {
                this.displayInfo.max = myMax;
            } else {
                // if present, check the current value, max must be equal or higher
                if (currentValue > this.displayInfo.max) {
                    this.displayInfo.max = currentValue;
                }
            }
            // now check min < max
            if (!!this.displayInfo.max && !!this.displayInfo.min) {
                if (this.displayInfo.min > this.displayInfo.max) {
                    this.displayInfo.max = 10 * this.displayInfo.min;
                }
            }
            if (this.displayInfo.discrete === undefined) {
                // we assume that sliders are used for discrete numbers
                this.displayInfo.discrete = true;
            }
            if (this.displayInfo.discrete === true) {
                // check the current value, it must be an integer
                if (currentValue % 1 !== 0) {
                    console.log("Value in NumberBox is not an integer value: " + currentValue);
                    this.displayInfo.step = undefined;
                    this.displayInfo.discrete = false;
                    this.displayInfo.showMarks = false;
                } else {
                    if (this.displayInfo.showMarks === undefined) {
                        this.displayInfo.showMarks = false;
                    } else {
                        if (this.displayInfo.step === undefined) {
                            this.displayInfo.step = 1;
                        } else {
                            // step must be a positive number
                            if (this.displayInfo.step < 0) {
                                this.displayInfo.step = Math.abs(this.displayInfo.step);
                            }
                            // check the step, it must be a valid divider of the current value
                            if (currentValue % this.displayInfo.step !== 0) {
                                this.displayInfo.step = 1;
                            } else {
                                // increase max if the step does not fit
                                let remainder: number =
                                    (this.displayInfo.max - this.displayInfo.min) % this.displayInfo.step;
                                if (remainder !== 0) {
                                    this.displayInfo.max += remainder;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

export function isNumberControlBox(b: Box): b is NumberControlBox {
    return b?.kind === "NumberControlBox"; // b instanceof NumberControlBox;
}
