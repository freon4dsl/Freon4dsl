import { model } from "../../../language";

@model
export class CoreTestAppliedFeature {
    feature: string = "unknown";

    get symbol(): string {
        return "." + this.feature;
    }

    toString(): string {
        return this.feature;
    }
}
