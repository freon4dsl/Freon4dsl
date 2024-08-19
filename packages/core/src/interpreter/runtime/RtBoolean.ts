import { RtObject } from "./RtObject";

export class RtBoolean extends RtObject {
    static readonly TRUE = new RtBoolean(true);
    static readonly FALSE = new RtBoolean(false);

    static of(bool: boolean): RtBoolean {
        return bool ? RtBoolean.TRUE : RtBoolean.FALSE;
    }
    readonly _type = "RtBoolean";
    private readonly _value: boolean;

    private constructor(value: boolean) {
        super();
        this._value = value;
    }

    asBoolean(): boolean {
        return this._value;
    }

    and(other: RtBoolean): RtBoolean {
        return RtBoolean.of(this._value && other.asBoolean());
    }

    or(other: RtBoolean): RtBoolean {
        return RtBoolean.of(this._value || other.asBoolean());
    }

    not(): RtBoolean {
        return RtBoolean.of(!this._value);
    }

    equals(other: RtObject): RtBoolean {
        if (isRtBoolean(other)) {
            return RtBoolean.of(this._value === other.asBoolean());
        } else {
            return RtBoolean.FALSE;
        }
    }

    toString(): string {
        return "" + this._value;
    }
}

export function isRtBoolean(object: any): object is RtBoolean {
    const _type = object?._type;
    return !!_type && _type === "RtBoolean";
}
