import { RtObject } from "./RtObject";

export class RtArray<T extends RtObject> extends RtObject {
    private value: RtObject[] = [];

    constructor() {
        super();
    }

    get array(): RtObject[] {
        return this.value;
    }
}
