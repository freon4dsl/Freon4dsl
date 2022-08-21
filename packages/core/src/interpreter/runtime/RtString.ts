import { RtObject } from "./RtObject";

export class RtString extends RtObject {
    _value: string;

    constructor(value: string) {
        super();
        this._value = value;
    }

    get value(): string {
        return this._value;
    }

    plus(other: Object): RtString {
        if (isRtString(other)) {
            return new RtString(this._value + other.value);
        } else {
            return new RtString(this._value + other.toString());
        }
    }

    toString(): string {
        return this.value
    }}

export function isRtString(obj: any): obj is RtString {
    return obj instanceof RtString;
}
