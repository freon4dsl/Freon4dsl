import BigNumber from "bignumber.js";
import { RtBoolean } from "./RtBoolean";
import { RtObject } from "./RtObject";

export type RtNumberRoundingMode = "Down" | "HalfUp" | "Truncate" | "Up";

export class RtNumber extends RtObject {
    readonly _type: string = "RtNumber";

    static ZERO: RtNumber = new RtNumber(0);

    private value: BigNumber;

    constructor(v: BigNumber | number) {
        super();
        if (typeof v === "number") {
            this.value = new BigNumber(v);
        } else {
            this.value = v;
        }
    }

    asBigNumber(): BigNumber {
        return this.value;
    }

    asNumber(): number {
        return this.value.toNumber();
    }

    mul(other: RtNumber): RtNumber {
        return new RtNumber(this.value.times(other.value));
    }

    div(other: RtNumber): RtNumber {
        return new RtNumber(new BigNumber(this.value.div(other.value)));
    }

    toFixed(decimals: number): RtNumber {
        return new RtNumber(new BigNumber(this.value.toFixed(decimals, BigNumber.ROUND_DOWN)));
    }

    plus(other: RtNumber): RtNumber {
        return new RtNumber(this.value.plus(other.value));
    }

    minus(other: RtNumber): RtNumber {
        return new RtNumber(this.value.minus(other.value));
    }

    unaryMinus(): RtNumber {
        return new RtNumber(this.value.negated());
    }

    equals(other: RtObject): RtBoolean {
        if (isRtNumber(other)) {
            return RtBoolean.of(this.value.isEqualTo(other.asBigNumber()));
        } else {
            return RtBoolean.FALSE;
        }
    }

    notEquals(other: RtNumber): RtBoolean {
        return RtBoolean.of(!this.value.isEqualTo(other.value));
    }

    less(other: RtNumber): RtBoolean {
        const x = RtBoolean.of(this.value.isLessThan(other.value));
        return x;
    }

    lessEquals(other: RtNumber): RtBoolean {
        return RtBoolean.of(this.value.isLessThanOrEqualTo(other.value));
    }

    greater(other: RtNumber): RtBoolean {
        return RtBoolean.of(this.value.isGreaterThan(other.value));
    }

    greaterEquals(other: RtNumber): RtBoolean {
        return RtBoolean.of(this.value.isGreaterThanOrEqualTo(other.value));
    }

    round(decimals: number, roundingMode: RtNumberRoundingMode): RtNumber {
        return new RtNumber(this.value.dp(decimals, this.roundingMode(roundingMode)));
    }

    private roundingMode(roundingMode: RtNumberRoundingMode): BigNumber.RoundingMode {
        switch (roundingMode) {
            case "HalfUp":
                return BigNumber.ROUND_HALF_UP;
            case "Down":
                return BigNumber.ROUND_DOWN;
            case "Up":
                return BigNumber.ROUND_UP;
            case "Truncate":
                return BigNumber.ROUND_DOWN;
            default:
                return BigNumber.ROUND_HALF_UP;
        }
    }

    toString(): string {
        return "" + this.value;
    }
}

export function isRtNumber(object: any): object is RtNumber {
    const _type = (object as any)?._type;
    return !!_type && _type === "RtNumber";
}
