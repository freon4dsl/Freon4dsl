import { RtObject } from "./RtObject";

export class RtString extends RtObject {
    readonly _type = "RtString";

    _stringValue: string;

    constructor(value: string) {
        super();
        this._stringValue = value;
    }

    get value(): string {
        return this._stringValue;
    }

    plus(other: RtObject): RtString {
        if (isRtString(other)) {
            return new RtString(this._stringValue + other.value);
        } else {
            return new RtString(this._stringValue + other.toString());
        }
    }

    toString(): string {
        return this.value
    }
}

export function isRtString(obj: Object): obj is RtString {
    return Object.getPrototypeOf(obj)?.constructor?.name === "RtString";
}
