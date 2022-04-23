import { Checker, CheckRunner } from "../../utils";
import { PiLanguage } from "../metalanguage";
import { PiLangCheckerPhase2 } from "./PiLangCheckerPhase2";
import { PiLangCheckerPhase1 } from "./PiLangCheckerPhase1";

export class PiLangChecker extends Checker<PiLanguage> {

    check(language: PiLanguage): void {
        const runner = new CheckRunner(this.errors, this.warnings);
        const phase1: PiLangCheckerPhase1 = new PiLangCheckerPhase1(language);
        phase1.check(language, runner);
        // now everything has been resolved, check that all concepts and interfaces have
        // unique names, that there are no circular inheritance or interface relationships,
        // and that all their properties are consistent with regard to inheritance
        const phase2: PiLangCheckerPhase2 = new PiLangCheckerPhase2(language);
        phase2.check(language, runner);
    }
}
