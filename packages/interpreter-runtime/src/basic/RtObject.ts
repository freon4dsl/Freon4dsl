import { RtBoolean } from "./RtBoolean";

export interface IRtObject {
    get rtType(): string;
}

export abstract class RtObject implements IRtObject {
    readonly _type: string = "RtObject";

    constructor() {}

    get rtType(): string {
        return this._type;
    }

    stringify(indent?: number): string {
        return JSON.stringify(this);
    }

    abstract equals(other: RtObject): RtBoolean;
}
