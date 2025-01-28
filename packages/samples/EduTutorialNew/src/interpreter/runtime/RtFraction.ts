import { RtBoolean, RtNumber, RtObject } from "@freon4dsl/core";

export class RtFraction extends RtObject {
    readonly _type: string = "RtFraction";

    nominator: RtNumber;
    denumerator: RtNumber;

    constructor(num: RtNumber, den: RtNumber) {
        super();
        this.nominator = num;
        this.denumerator = den;
    }

    override equals(other: RtObject): RtBoolean {
        if (isRtFraction(other)) {
            return this.nominator.equals(other.nominator).and(this.denumerator.equals(other.denumerator));
        } else {
            return RtBoolean.FALSE;
        }
    }
    
    override toString(): string {
        return this.nominator.toString() + "/" + this.denumerator.toString()
    }
}

export function isRtFraction(object: any): object is RtFraction {
    const _type = (object as any)?._type;
    return !!_type && _type === "RtFraction";
}
