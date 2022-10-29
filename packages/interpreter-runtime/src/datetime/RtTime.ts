import { LocalTime } from "@js-joda/core";
import { RtBoolean } from "../basic/RtBoolean";
import { RtNumber } from "../basic/RtNumber";
import { RtObject } from "../basic/RtObject";
import { RtTimeDelta } from "./RtTimeDelta";

export class RtTime extends RtObject {
    readonly _type: string = "RtTime";

    static fromLocalTime(time: LocalTime): RtTime {
        const result = new RtTime();
        result._time = time;
        return result;
    }

    static fromHHMMSS(hours: number | RtNumber, minutes: number | RtNumber, seconds: number | RtNumber): RtTime {
        const result = new RtTime();
        const _hours = typeof hours === "number" ? new RtNumber(hours) : hours;
        const _minutes = typeof minutes === "number" ? new RtNumber(minutes) : minutes;
        const _seconds = typeof seconds === "number" ? new RtNumber(seconds) : seconds;
        result._time = LocalTime.of(_hours.asBigNumber().toNumber(), _minutes.asBigNumber().toNumber(), _seconds.asBigNumber().toNumber());
        return result;
    }

    private _time: LocalTime;

    constructor() {
        super();
    }

    get hours(): RtNumber {
        return new RtNumber(this._time.hour());
    }

    get minutes(): RtNumber {
        return new RtNumber(this._time.minute());
    }

    get seconds(): RtNumber {
        return new RtNumber(this._time.second());
    }

    plusHours(other: RtTimeDelta): RtTime {
        return RtTime.fromLocalTime(this._time.plusHours(other.hours.asNumber()));
    }

    plusMinutes(other: RtTimeDelta): RtTime {
        return RtTime.fromLocalTime(this._time.plusMinutes(other.minutes.asNumber()));
    }

    plusSeconds(other: RtTimeDelta): RtTime {
        return RtTime.fromLocalTime(this._time.plusSeconds(other.seconds.asNumber()));
    }

    minusHours(other: RtTimeDelta): RtTime {
        return RtTime.fromLocalTime(this._time.minusHours(other.hours.asNumber()));
    }

    minusMinutes(other: RtTimeDelta): RtTime {
        return RtTime.fromLocalTime(this._time.minusMinutes(other.minutes.asNumber()));
    }

    minusSeconds(other: RtTimeDelta): RtTime {
        return RtTime.fromLocalTime(this._time.minusSeconds(other.seconds.asNumber()));
    }

    equals(other: RtObject): RtBoolean {
        if (isRtTime(other)) {
            return RtBoolean.of(this._time.equals(other._time));
        } else {
            return RtBoolean.FALSE;
        }
    }

    notEquals(other: RtObject): RtBoolean {
        return this.equals(other).not();
    }

    less(other: RtTime): RtBoolean {
        return RtBoolean.of(this._time.isBefore(other._time));
    }

    lessEquals(other: RtTime): RtBoolean {
        return RtBoolean.of(this._time.isBefore(other._time) || this._time.equals(other._time));
    }

    greater(other: RtTime): RtBoolean {
        return RtBoolean.of(this._time.isAfter(other._time));
    }

    greaterEquals(other: RtTime) {
        return RtBoolean.of(this._time.isAfter(other._time) || this._time.equals(other._time));
    }

    toString(): string {
        return this.hours.toString().padStart(2, "0") + ":" + this.minutes.toString().padStart(2, "0") + ":" + this.seconds.toString().padStart(2, "0");
    }
}

export function isRtTime(object: any): object is RtTime {
    const _type = (object as any)?._type;
    return !!_type && _type === "RtTime";
}
