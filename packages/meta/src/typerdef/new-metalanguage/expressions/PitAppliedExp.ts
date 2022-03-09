import { PitExp } from "./PitExp";

export abstract class PitAppliedExp extends PitExp {
    source: PitExp;
}
