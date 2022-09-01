import { RtObject } from "./RtObject";

export class RtEmpty extends RtObject {
    readonly _type = "RtEmpty";

    constructor() {
        super();
    }

    toString(): string {
        return "RtEmpty";
    }
}

export function isRtEmpty(obj: any): obj is RtEmpty {
    return obj instanceof RtEmpty;
}
