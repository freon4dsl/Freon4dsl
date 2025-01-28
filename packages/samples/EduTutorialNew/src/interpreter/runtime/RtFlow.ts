import { RtBoolean, RtObject } from "@freon4dsl/core";
import { Flow } from "../../language/gen/index.js";

export class RtFlow extends RtObject {
    readonly _type: string = "RtFlow";
    flow: Flow;

    constructor(page: Flow) {
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

export function isRtFlowDescription(object: any): object is RtFlow {
    const _type = (object as any)?._type;
    return !!_type && _type === "RtFlowDescription";
}
