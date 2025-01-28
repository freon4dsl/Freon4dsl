import { RtBoolean, RtObject } from "@freon4dsl/core";
import { Question } from "../../language/gen/index.js";

export class RtAnswer extends RtObject {
    readonly _type: string = "RtAnswer";
    value: RtObject;
    question: Question;

    constructor(question: Question, value: RtObject) {
        super();
        this.value = value;
        this.question = question;
    }

    equals(other: RtObject): RtBoolean {
        if (isRtAnswer(other)) {
            return RtBoolean.of(this.value === other.value && this.question === other.question);
        } else {
            return RtBoolean.FALSE;
        }
    }

    override toString(): string {
        return `Question: ${this.question.name}, answer ${this.value}`;
    }
}

export function isRtAnswer(object: any): object is RtAnswer {
    const _type = (object as any)?._type;
    return !!_type && _type === "RtAnswer";
}
