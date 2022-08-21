import { RtObject } from "./RtObject";

export class RtBoolean extends  RtObject {
    value: boolean;

    constructor(value: boolean) {
        super();
        this.value = value;
    }

    and(other: RtBoolean): RtBoolean {
        return new RtBoolean(this.value && other.value);
    }

    or(other: RtBoolean): RtBoolean {
        return new RtBoolean(this.value || other.value);
    }

    toString(): string {
        return "" + this.value
    }
}


export function isRtBoolean(obj: any): obj is RtBoolean {
    return obj instanceof RtBoolean;
}

