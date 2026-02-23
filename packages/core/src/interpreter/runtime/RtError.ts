import { isNullOrUndefined, notNullOrUndefined } from "../../util/index.js"
import { RtBoolean } from "./RtBoolean.js";
import { RtObject } from "./RtObject.js";

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

    // parameter is present to adhere to signature of super class
    equals(_other: RtObject): RtBoolean {
        return RtBoolean.FALSE;
    }

    toString(): string {
        return "Error: " + this._message;
    }
}

export function isRtError(obj: object): obj is RtError {
    if (isNullOrUndefined(obj)) {
        return false
    } 
    const _type = obj["._type"];
    return notNullOrUndefined(_type) && _type === "RtError";
}
