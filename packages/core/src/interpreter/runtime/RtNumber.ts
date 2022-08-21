import { RtObject } from "./RtObject";
import { isRtString } from "./RtString";

export class RtNumber extends RtObject { //} implements RtHasPlus  {
    private _value: number;

    constructor(value: number) {
        super();
        this._value = value;
    }

    get value(): number {
        return this._value;
    }

    plus(other: Object): RtObject {
        if (isRtNumber(other)) {
            return new RtNumber(this._value + other.value);
        }
        if( isRtString(other)) {
            return new RtNumber(this._value + Number.parseFloat(other.value));
        }
        throw new Error("No plus found")
    }

    multiply(other: Object): RtObject {
        if (isRtNumber(other)) {
            return new RtNumber(this._value * other.value);
        }
        if( isRtString(other)) {
            return new RtNumber(this._value * Number.parseFloat(other.value));
        }
        throw new Error("No multiply found")
    }

    minus(other: Object): RtObject {
        if (isRtNumber(other)) {
            return new RtNumber(this._value - other.value);
        }
        if( isRtString(other)) {
            return new RtNumber(this._value - Number.parseFloat(other.value));
        }
        throw new Error("No minus found")
    }

    divide(other: Object): RtObject {
        if (isRtNumber(other)) {
            return new RtNumber(this._value / other.value);
        }
        if( isRtString(other)) {
            return new RtNumber(this._value / Number.parseFloat(other.value));
        }
        throw new Error("No divide found")
    }

    toString(): string {
        return "" + this._value
    }
}

export function isRtNumber(obj: any): obj is RtNumber {
    return obj instanceof RtNumber;
}
