import { RtObject } from "./RtObject";

export class RtBoolean extends  RtObject {
    readonly _type = "RtBoolean";

    static of(bool: boolean): RtBoolean {
        return bool ? RtTrue : RtFalse;
    }

    private _value: boolean;

    constructor(value: boolean) {
        super();
        this._value = value;
    }

    asBoolean(): boolean {
        return this.value;
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

    equals(other: RtObject): RtBoolean {
        if ( isRtBoolean(other)) {
            return new RtBoolean(this.value === other.asBoolean());
        } else {
            return RtFalse;
        }
    }

    toString(): string {
        return "" + this._value
    }
}

export const RtTrue = new RtBoolean(true);
export const RtFalse = new RtBoolean(false);

export function isRtBoolean(object: any): object is RtBoolean {
    const _type = object?._type;
    return !!_type && _type === "RtBoolean";
}
