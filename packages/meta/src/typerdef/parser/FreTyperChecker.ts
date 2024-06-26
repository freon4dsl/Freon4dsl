import {Checker, CheckRunner, ParseLocationUtil} from "../../utils";
import { FreTyperCheckerPhase1 } from "./FreTyperCheckerPhase1";
import { FreTyperCheckerPhase2 } from "./FreTyperCheckerPhase2";
import { TyperDef } from "../metalanguage";

export class FreTyperChecker extends Checker<TyperDef> {
    runner: CheckRunner = new CheckRunner(this.errors, this.warnings);

    check(definition: TyperDef): void {
        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Editor definition checker does not known the language, exiting ` +
                `${ParseLocationUtil.location(definition)}.`);
        }
        const phase1: FreTyperCheckerPhase1 = new FreTyperCheckerPhase1(this.language);
        phase1.check(definition, this.runner);
        // now everything has been resolved, check ...
        const phase2: FreTyperCheckerPhase2 = new FreTyperCheckerPhase2(this.language);
        phase2.check(definition, this.runner);
    }
}
