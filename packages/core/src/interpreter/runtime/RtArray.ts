import { RtBoolean } from "./RtBoolean";
import { RtNumber } from "./RtNumber";
import { RtObject } from "./RtObject";

/**
 * Represents a runtime list containing runtime objects.
 * You can directly access the underlying `Array` and change it (e.g. with push or slice).
 * This means that this object is **not immutable**!
 */
export class RtArray<T extends RtObject> extends RtObject {
    readonly _type = "RtArray";

    private value: T[] = [];

    constructor() {
        super();
    }

    /**
     * Returns the underlying Array object.
     */
    get array(): T[] {
        return this.value;
    }

    /**
     * returns the lenght of the underlying array as an `RtNumber`.
     */
    length(): RtNumber {
        return new RtNumber(this.array.length);
    }

    // @ts-ignore
    // parameter is present to adhere to signature of super class
    equals(other: RtObject): RtBoolean {
        return RtBoolean.FALSE;
    }
}

/**
 * Type guard to check whether an object is an rtArray.
 * @param object
 */
export function isRtArray(object: any): object is RtArray<RtObject> {
    const _type = (object as any)?._type;
    return !!_type && _type === "RtArray";
}
