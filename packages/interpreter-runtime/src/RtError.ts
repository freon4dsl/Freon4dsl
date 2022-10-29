export class RtError {
    readonly _type = "RtError";

    private _message: string = "Error";

    constructor(message: string) {
        this._message = message;
    }

    get message(): string {
        return this._message;
    }

    toString(): string {
        return "Error: " + this._message;
    }
}

export function isRtError(obj: any): obj is RtError {
    const _type = (obj as any)?._type;
    return !!_type && _type === "RtError";
}
