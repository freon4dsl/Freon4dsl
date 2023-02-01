import { isRtBoolean, RtBoolean } from "./RtBoolean";
import { RtObject } from "./RtObject";

export class RtEmpty extends RtObject {
    readonly _type: string = "RtEmpty";

    static NIX_VALUE = new RtEmpty();

    toString(): string {
        return "RtNix";
    }

    override equals(other: RtObject): RtBoolean {
        if (isRtBoolean(other)) {
            if (!other.asBoolean()) {
                return RtBoolean.TRUE;
            }
        } else if (isRtEmpty(other)) {
            return RtBoolean.TRUE;
        }
        return RtBoolean.FALSE;
    }

}

export function isRtEmpty(object: any): object is RtEmpty {
    return object !== undefined && object !== null && object["_type"] === "RtEmpty";
}
