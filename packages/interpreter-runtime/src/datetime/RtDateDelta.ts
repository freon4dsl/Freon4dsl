import { RtBoolean } from "../basic/RtBoolean";
import { RtNumber } from "../basic/RtNumber";
import { RtObject } from "../basic/RtObject";

export class RtDateDelta extends RtObject {
    readonly _type: string = "RtDateDelta";

    private _years: RtNumber;
    private _months: RtNumber;
    private _weeks: RtNumber;
    private _days: RtNumber;

    constructor(years: number | RtNumber, months: number | RtNumber, weeks: number | RtNumber, days: number | RtNumber) {
        super();
        this._years = typeof years === "number" ? new RtNumber(years) : years;
        this._months = typeof months === "number" ? new RtNumber(months) : months;
        this._weeks = typeof weeks === "number" ? new RtNumber(weeks) : weeks;
        this._days = typeof days === "number" ? new RtNumber(days) : days;
    }

    get years(): RtNumber {
        return this._years;
    }

    get months(): RtNumber {
        return this._months;
    }

    get weeks(): RtNumber {
        return this._weeks;
    }

    get days(): RtNumber {
        return this._days;
    }

    equals(other: RtObject): RtBoolean {
        if (isRtDateDelta(other)) {
            return this.years.equals(other.years).and(this.months.equals(other.months)).and(this.weeks.equals(other.weeks)).and(this.days.equals(other.days));
        } else {
            return RtBoolean.FALSE;
        }
    }

    plus(other: RtDateDelta): RtDateDelta {
        return new RtDateDelta(this.years.plus(other.years), this.months.plus(other.months), this.weeks.plus(other.weeks), this.days.plus(other.days));
    }

    minus(other: RtDateDelta): RtDateDelta {
        return new RtDateDelta(this.years.minus(other.years), this.months.minus(other.months), this.weeks.minus(other.weeks), this.days.minus(other.days));
    }

    mul(other: RtNumber): RtDateDelta {
        return new RtDateDelta(this.years.mul(other), this.months.mul(other), this.weeks.mul(other), this.days.mul(other));
    }

    div(other: RtNumber): RtDateDelta {
        return new RtDateDelta(this.years.div(other), this.months.div(other), this.weeks.div(other), this.days.div(other));
    }

    unaryMinus(): RtDateDelta {
        return new RtDateDelta(this.years.unaryMinus(), this.months.unaryMinus(), this.weeks.unaryMinus(), this.days.unaryMinus());
    }

    // toNumber(): RtNumber {
    //     if( !this.hours.asBigNumber().isZero() && this.minutes.asBigNumber().isZero() &&this.seconds.asBigNumber().isZero() ) {
    //         return this.hours;
    //     } else if( this.hours.asBigNumber().isZero() && !this.minutes.asBigNumber().isZero() &&this.seconds.asBigNumber().isZero() ){
    //         return this.minutes;
    //     } else if (this.hours.asBigNumber().isZero() && this.minutes.asBigNumber().isZero() && !this.seconds.asBigNumber().isZero() ){
    //         return this.seconds;
    //     }
    //     throw new RtError("RtDateDelta " + this.toString() + "is not discrete, cannot return number");
    // }
    //
    toString(): string {
        return (
            this.years.toString().padStart(2, "0") +
            "." +
            this.months.toString().padStart(2, "0") +
            "." +
            this.weeks.toString().padStart(2, "0") +
            "." +
            this.days.toString().padStart(2, "0")
        );
    }
}

export function isRtDateDelta(object: any): object is RtDateDelta {
    const _type = (object as any)?._type;
    return !!_type && _type === "RtDateDelta";
}
