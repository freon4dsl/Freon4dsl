import { RtBoolean, RtFalse } from "./RtBoolean";
import { RtNumber } from "./RtNumber";
import { RtObject } from "./RtObject";

/**
 * Represents a runtime list containing runtime objects.
 * You can directly access the underlying `Array` and change it (e.g. with push or slice).
 * This means that this object is **not immutable**!
 */
export class RtArray<T extends RtObject> extends RtObject {
    readonly _type = "RtArray";

    private value: RtObject[] = [];

    constructor() {
        super();
    }

    get array(): RtObject[] {
        return this.value;
    }

    /**
     * returns the lenght of the underlying array as an `RtNumber`.
     */
    length(): RtNumber {
        return new RtNumber(this.array.length);
    }

    equals(other: RtObject): RtBoolean {
        return RtFalse;
    }

}
