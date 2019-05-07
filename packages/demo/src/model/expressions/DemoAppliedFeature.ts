import { model } from "@projectit/model";

@model
export class DemoAppliedFeature {
    feature: string = "unknown";

    get symbol(): string {
        return "." + this.feature;
    }

    toString(): string {
        return this.feature;
    }
}
