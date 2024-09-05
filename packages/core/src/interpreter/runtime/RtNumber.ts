import { RtBoolean } from "./RtBoolean";
import { isRtError, RtError } from "./RtError";
import { RtObject } from "./RtObject";
import { isRtString } from "./RtString";
import { isRtEmpty } from "./RtEmpty";

export class RtNumber extends RtObject {
    // } implements RtHasPlus  {
    readonly _type = "RtNumber";
    private readonly _value: number;

    constructor(value: number) {
        super();
        this._value = value;
    }

    get value(): number {
        return this._value;
    }

    plus(other: RtObject): RtObject {
        if (isRtNumber(other)) {
            return new RtNumber(this._value + other.value);
        }
        if (isRtString(other)) {
            return new RtNumber(this._value + Number.parseFloat(other.asString()));
        } else if (isRtEmpty(other)) {
            return this;
        } else if (isRtError(other)) {
            return other;
        }
        // @ts-ignore TS assumes other is of type 'never', but that is incorrect.
        return new RtError("RtNumber.divide: no divide found for " + other.rtType);
    }

    multiply(other: RtObject): RtObject {
        if (isRtNumber(other)) {
            return new RtNumber(this._value * other.value);
        } else if (isRtString(other)) {
            return new RtNumber(this._value * Number.parseFloat(other.asString()));
        } else if (isRtEmpty(other)) {
            return this;
        } else if (isRtError(other)) {
            return other;
        }
        // @ts-ignore TS assumes other is of type 'never', but that is incorrect.
        return new RtError("RtNumber.divide: no divide found for " + this + " * " + other.rtType);
    }

    minus(other: RtObject): RtObject {
        if (isRtNumber(other)) {
            return new RtNumber(this._value - other.value);
        }
        if (isRtString(other)) {
            return new RtNumber(this._value - Number.parseFloat(other.asString()));
        } else if (isRtEmpty(other)) {
            return other;
        } else if (isRtError(other)) {
            return other;
        }
        // @ts-ignore TS assumes other is of type 'never', but that is incorrect.
        return new RtError("No minus found for " + other.rtType);
    }

    divide(other: RtObject): RtObject {
        if (isRtNumber(other)) {
            return new RtNumber(this._value / other.value);
        } else if (isRtString(other)) {
            return new RtNumber(this._value / Number.parseFloat(other.asString()));
        } else if (isRtEmpty(other)) {
            return other;
        } else if (isRtError(other)) {
            return other;
        }
        // @ts-ignore TS assumes other is of type 'never', but that is incorrect.
        return new RtError("RtNumber.divide: no divide found for " + other.rtType);
    }

    equals(other: RtObject): RtBoolean {
        if (isRtNumber(other)) {
            return RtBoolean.of(this.value === other.value);
        } else {
            return RtBoolean.FALSE;
        }
    }

    toString(): string {
        return "" + this._value;
    }
}

export function isRtNumber(obj: any): obj is RtNumber {
    return obj instanceof RtNumber;
}
