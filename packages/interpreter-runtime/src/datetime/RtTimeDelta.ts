import { RtBoolean } from "../basic/RtBoolean";
import { RtError } from "../RtError";
import { RtNumber } from "../basic/RtNumber";
import { RtObject } from "../basic/RtObject";

/**
 * Runtime representation of a `TimeDelta` value: an amount of time in hours/minutes/seconds.
 */
export class RtTimeDelta extends RtObject {
    readonly _type: string = "RtTimeDelta";

    private _hours: RtNumber;
    private _minutes: RtNumber;
    private _seconds: RtNumber;

    constructor(hours: number | RtNumber, minutes: number | RtNumber, seconds: number | RtNumber) {
        super();
        this._hours = typeof hours === "number" ? new RtNumber(hours) : hours;
        this._minutes = typeof minutes === "number" ? new RtNumber(minutes) : minutes;
        this._seconds = typeof seconds === "number" ? new RtNumber(seconds) : seconds;
    }

    get hours(): RtNumber {
        return this._hours;
    }

    get minutes(): RtNumber {
        return this._minutes;
    }

    get seconds(): RtNumber {
        return this._seconds;
    }

    equals(other: RtObject): RtBoolean {
        if (isRtTimeDelta(other)) {
            return this.hours
                .mul(new RtNumber(3600))
                .plus(this.minutes.mul(new RtNumber(60)))
                .plus(this.seconds)
                .equals(
                    other.hours
                        .mul(new RtNumber(3600))
                        .plus(other.minutes.mul(new RtNumber(60)))
                        .plus(other.seconds)
                );
        } else {
            return RtBoolean.FALSE;
        }
    }

    plus(other: RtTimeDelta): RtTimeDelta {
        const x = this.hours.plus(other.hours);
        return new RtTimeDelta(this.hours.plus(other.hours), this.minutes.plus(other.minutes), this.seconds.plus(other.seconds));
    }

    minus(other: RtTimeDelta): RtTimeDelta {
        return new RtTimeDelta(this.hours.minus(other.hours), this.minutes.minus(other.minutes), this.seconds.minus(other.seconds));
    }

    mul(other: RtNumber): RtTimeDelta {
        return new RtTimeDelta(this.hours.mul(other), this.minutes.mul(other), this.seconds.mul(other));
    }

    div(other: RtNumber): RtTimeDelta {
        return new RtTimeDelta(this.hours.div(other), this.minutes.div(other), this.seconds.div(other));
    }

    unaryMinus(): RtTimeDelta {
        return new RtTimeDelta(this.hours.unaryMinus(), this.minutes.unaryMinus(), this.seconds.unaryMinus());
    }

    toNumber(): RtNumber {
        if (!this.hours.asBigNumber().isZero() && this.minutes.asBigNumber().isZero() && this.seconds.asBigNumber().isZero()) {
            return this.hours;
        } else if (this.hours.asBigNumber().isZero() && !this.minutes.asBigNumber().isZero() && this.seconds.asBigNumber().isZero()) {
            return this.minutes;
        } else if (this.hours.asBigNumber().isZero() && this.minutes.asBigNumber().isZero() && !this.seconds.asBigNumber().isZero()) {
            return this.seconds;
        }
        throw new RtError("RtTimeDelta " + this.toString() + "is not discrete, cannot return number");
    }

    toString(): string {
        return this._hours.toString().padStart(2, "0") + ":" + this._minutes.toString().padStart(2, "0") + ":" + this._seconds.toString().padStart(2, "0");
    }
}

/**
 * Type guard to check whether an object is an RtTimeDelta.
 * @param object
 */
export function isRtTimeDelta(object: any): object is RtTimeDelta {
    const _type = (object as any)?._type;
    return !!_type && _type === "RtTimeDelta";
}
