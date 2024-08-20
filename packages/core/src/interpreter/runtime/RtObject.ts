import { RtBoolean } from "./RtBoolean";

export interface IRtObject {
    get rtType(): string;
}

export abstract class RtObject implements IRtObject {
    readonly _type: string = "RtObject";

    get rtType(): string {
        return this._type;
    }

    abstract equals(other: RtObject): RtBoolean;
}
