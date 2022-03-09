import { PitExp } from "./PitExp";

export abstract class PitStatement extends PitExp {
    left: PitExp;
    right: PitExp;
    toPiString(): string {
        return `SHOULD BE IMPLEMENTED BY SUBCLASSES OF PitStatement`;
    }
}
