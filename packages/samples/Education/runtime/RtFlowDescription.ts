import { RtBoolean, RtObject } from "@freon4dsl/core";
import { FlowDescription } from "../Education/language/gen/index";

export class RtFlowDescription extends RtObject {
    readonly _type: string = "RtFlow";
    flow: FlowDescription;

    constructor(page: FlowDescription) {
        super();
        this.flow = page;
    }

    equals(other: RtObject): RtBoolean {
        if (isRtFlowDescription(other)) {
            return RtBoolean.of(this.flow === other.flow);
        } else {
            return RtBoolean.FALSE;
        }
    }

    override toString(): string {
        return `Flow: ${this.flow.name}`;
    }
}

export function isRtFlowDescription(object: any): object is RtFlowDescription {
    const _type = (object as any)?._type;
    return !!_type && _type === "RtFlowDescription";
}
