import { RtBoolean, RtObject } from "@freon4dsl/core";
import { Topic } from "../../language/gen/index.js";

export class RtTopic extends RtObject {
    readonly _type: string = "RtTopic";
    topic: Topic;

    constructor(topic: Topic) {
        super();
        this.topic = topic;
    }

    equals(other: RtObject): RtBoolean {
        if (isRtTopic(other)) {
            return RtBoolean.of(this.topic === other.topic);
        } else {
            return RtBoolean.FALSE;
        }
    }

    override toString(): string {
        return `Topic: ${this.topic.name}`;
    }
}

export function isRtTopic(object: any): object is RtTopic {
    const _type = (object as any)?._type;
    return !!_type && _type === "RtTopic";
}
