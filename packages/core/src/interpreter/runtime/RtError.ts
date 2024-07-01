import { RtBoolean } from "./RtBoolean";
import { RtObject } from "./RtObject";

export class RtError extends RtObject {
    readonly _type = "RtError";

    private readonly _message: string = "Error";

    constructor(message: string) {
        super();
        this._message = message;
    }

    get message(): string {
        return this._message;
    }

    // @ts-ignore
    // parameter is present to adhere to signature of super class
    equals(other: RtObject): RtBoolean {
        return RtBoolean.FALSE;
    }

    toString(): string {
        return "Error: " + this._message;
    }
}

export function isRtError(obj: any): obj is RtError {
    const _type = (obj as any)?._type;
    return !!_type && _type === "RtError";
}
