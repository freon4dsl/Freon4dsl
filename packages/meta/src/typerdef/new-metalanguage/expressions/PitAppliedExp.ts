import { PitExp } from "./PitExp";

export abstract class PitAppliedExp extends PitExp {
    source: PitExp;

    baseSource(): PitExp {
        if (!!this.source) {
            return this.source.baseSource();
        } else {
            return this;
        }
    }
}
