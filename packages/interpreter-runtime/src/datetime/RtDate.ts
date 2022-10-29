import { LocalDate } from "@js-joda/core";
import { RtBoolean } from "../basic/RtBoolean";
import { RtDateDelta } from "./RtDateDelta";
import { RtNumber } from "../basic/RtNumber";
import { RtObject } from "../basic/RtObject";

export class RtDate extends RtObject {
    readonly _type: string = "RtDate";

    static fromLocalDate(date: LocalDate): RtDate {
        const result = new RtDate();
        result._date = date;
        return result;
    }

    static fromYYYMMDD(year: number | RtNumber, month: number | RtNumber, day: number | RtNumber): RtDate {
        const result = new RtDate();
        const _year = typeof year === "number" ? new RtNumber(year) : year;
        const _month = typeof month === "number" ? new RtNumber(month) : month;
        const _day = typeof day === "number" ? new RtNumber(day) : day;
        result._date = LocalDate.of(_year.asBigNumber().toNumber(), _month.asBigNumber().toNumber(), _day.asBigNumber().toNumber());
        return result;
    }

    static now(): RtDate {
        return RtDate.fromLocalDate(LocalDate.now());
    }

    static BEGINNING_OF_TIME = RtDate.fromLocalDate(LocalDate.MIN);

    private _date: LocalDate;

    constructor() {
        super();
    }

    get year(): RtNumber {
        return new RtNumber(this._date.year());
    }

    get month(): RtNumber {
        return new RtNumber(this._date.month().value());
    }

    get day(): RtNumber {
        return new RtNumber(this._date.dayOfMonth());
    }

    plusYears(other: RtDateDelta): RtDate {
        return RtDate.fromLocalDate(this._date.plusYears(other.years.asNumber()));
    }

    plusMonths(other: RtDateDelta): RtDate {
        return RtDate.fromLocalDate(this._date.plusMonths(other.months.asNumber()));
    }

    plusWeeks(other: RtDateDelta): RtDate {
        return RtDate.fromLocalDate(this._date.plusWeeks(other.weeks.asNumber()));
    }

    plusDays(other: RtDateDelta): RtDate {
        return RtDate.fromLocalDate(this._date.plusDays(other.days.asNumber()));
    }

    minusYears(other: RtDateDelta): RtDate {
        return RtDate.fromLocalDate(this._date.minusYears(other.years.asNumber()));
    }

    minusMonths(other: RtDateDelta): RtDate {
        return RtDate.fromLocalDate(this._date.minusMonths(other.months.asNumber()));
    }

    minusWeeks(other: RtDateDelta): RtDate {
        return RtDate.fromLocalDate(this._date.minusWeeks(other.weeks.asNumber()));
    }

    minusDays(other: RtDateDelta): RtDate {
        return RtDate.fromLocalDate(this._date.minusDays(other.days.asNumber()));
    }

    equals(other: RtObject): RtBoolean {
        if (isRtDate(other)) {
            return this.year.equals(other.year).and(this.month.equals(other.month)).and(this.day.equals(other.day));
        } else {
            return RtBoolean.FALSE;
        }
    }

    notEquals(other: RtObject): RtBoolean {
        return this.equals(other).not();
    }

    less(other: RtDate): RtBoolean {
        return RtBoolean.of(this._date.isBefore(other._date));
    }

    lessEquals(other: RtDate): RtBoolean {
        return RtBoolean.of(this._date.isBefore(other._date) || this._date.isEqual(other._date));
    }

    greater(other: RtDate): RtBoolean {
        return RtBoolean.of(this._date.isAfter(other._date));
    }

    greaterEquals(other: RtDate) {
        return RtBoolean.of(this._date.isAfter(other._date) || this._date.isEqual(other._date));
    }

    toString(): string {
        return this.day.toString().padStart(2, "0") + "." + this.month.toString().padStart(2, "0") + "." + this.year.toString().padStart(4, "0");
    }
}

export function isRtDate(object: any): object is RtDate {
    const _type = (object as any)?._type;
    return !!_type && _type === "RtDate";
}
