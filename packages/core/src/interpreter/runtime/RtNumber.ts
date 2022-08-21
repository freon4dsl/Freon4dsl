import { RtObject } from "./RtObject";
import { isRtString } from "./RtString";

export class RtNumber extends RtObject { //} implements RtHasPlus  {
    value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }

    plus(other: Object): RtObject {
        if (isRtNumber(other)) {
            return new RtNumber(this.value + other.value);
        }
        if( isRtString(other)) {
            return new RtNumber(this.value + Number.parseFloat(other.value));
        }
        throw new Error("No plus found")
    }

    multiply(other: Object): RtObject {
        if (isRtNumber(other)) {
            return new RtNumber(this.value * other.value);
        }
        if( isRtString(other)) {
            return new RtNumber(this.value * Number.parseFloat(other.value));
        }
        throw new Error("No multiply found")
    }

    minus(other: Object): RtObject {
        if (isRtNumber(other)) {
            return new RtNumber(this.value - other.value);
        }
        if( isRtString(other)) {
            return new RtNumber(this.value - Number.parseFloat(other.value));
        }
        throw new Error("No minus found")
    }

    divide(other: Object): RtObject {
        if (isRtNumber(other)) {
            return new RtNumber(this.value / other.value);
        }
        if( isRtString(other)) {
            return new RtNumber(this.value / Number.parseFloat(other.value));
        }
        throw new Error("No divide found")
    }

    toString(): string {
        return "" + this.value
    }
}

export function isRtNumber(obj: any): obj is RtNumber {
    return obj instanceof RtNumber;
}
