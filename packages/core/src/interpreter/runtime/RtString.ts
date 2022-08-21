import { RtObject } from "./RtObject";

export class RtString extends RtObject {
    value: string;

    constructor(value: string) {
        super();
        this.value = value;
    }

    plus(other: Object): RtString {
        if (isRtString(other)) {
            return new RtString(this.value + other.value);
        } else {
            return new RtString(this.value + other.toString());
        }
    }

    toString(): string {
        return this.value
    }}

export function isRtString(obj: any): obj is RtString {
    return obj instanceof RtString;
}
