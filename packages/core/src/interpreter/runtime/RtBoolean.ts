import { RtObject } from "./RtObject";

export class RtBoolean extends  RtObject {
    private _value: boolean;

    constructor(value: boolean) {
        super();
        this._value = value;
    }

    get value(): boolean {
        return this._value;
    }

    and(other: RtBoolean): RtBoolean {
        return new RtBoolean(this._value && other.value);
    }

    or(other: RtBoolean): RtBoolean {
        return new RtBoolean(this._value || other.value);
    }

    toString(): string {
        return "" + this._value
    }
}


export function isRtBoolean(obj: any): obj is RtBoolean {
    return obj instanceof RtBoolean;
}

