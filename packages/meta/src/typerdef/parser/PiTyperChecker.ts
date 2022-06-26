import { Checker, CheckRunner } from "../../utils";
import { PiTyperCheckerPhase1 } from "./PiTyperCheckerPhase1";
import { PiTyperCheckerPhase2 } from "./PiTyperCheckerPhase2";
import { PiTyperDef } from "../metalanguage";


export class PiTyperChecker extends Checker<PiTyperDef>{
    runner = new CheckRunner(this.errors, this.warnings);

    check(definition: PiTyperDef): void {
        const phase1: PiTyperCheckerPhase1 = new PiTyperCheckerPhase1(this.language);
        phase1.check(definition, this.runner);
        // now everything has been resolved, check ...
        const phase2: PiTyperCheckerPhase2 = new PiTyperCheckerPhase2(this.language);
        phase2.check(definition, this.runner);
    }
}
