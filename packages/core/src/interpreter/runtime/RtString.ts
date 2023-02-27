import { RtBoolean } from "./RtBoolean";
import { RtNumber } from "./RtNumber";
import { RtObject } from "./RtObject";

export class RtString extends RtObject {
    static readonly EMPTY_STRING = new RtString("");
    readonly _type: string = "RtString";
    private readonly value: string;

    constructor(value: string) {
        super();
        this.value = value;
    }

    equals(other: RtObject): RtBoolean {
        if (isRtString(other)) {
            return RtBoolean.of(this.value === other.asString());
        } else {
            return RtBoolean.FALSE;
        }
    }

    asString(): string {
        return this.value;
    }

    startsWith(other: RtString): RtBoolean {
        return RtBoolean.of(this.asString().startsWith(other.asString()));
    }

    endsWith(other: RtString): RtBoolean {
        return RtBoolean.of(this.asString().endsWith(other.asString()));
    }

    length(): RtNumber {
        return new RtNumber(this.asString().length);
    }
}

export function isRtString(object: any): object is RtString {
    const _type = (object as any)?._type;
    return !!_type && _type === "RtString";
}
