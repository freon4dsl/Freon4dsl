import { RtBoolean, RtObject } from "@freon4dsl/core";
import { Grade } from "../../language/gen/index.js";

export class RtGrade extends RtObject {
    readonly _type: string = "RtGrade";
    grade: Grade;

    constructor(grade: Grade) {
        super();
        this.grade = grade;
    }

    equals(other: RtObject): RtBoolean {
        if (isRtGrade(other)) {
            return RtBoolean.of(this.grade === other.grade);
        } else {
            return RtBoolean.FALSE;
        }
    }

    override toString(): string {
        return `Grade: ${this.grade.name}`;
    }
}

export function isRtGrade(object: any): object is RtGrade {
    const _type = (object as any)?._type;
    return !!_type && _type === "RtGrade";
}
