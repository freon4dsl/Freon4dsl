import { Checker, CheckRunner } from "../../utils";
import { FreLanguage } from "../metalanguage";
import { FreLangCheckerPhase2 } from "./FreLangCheckerPhase2";
import { FreLangCheckerPhase1 } from "./FreLangCheckerPhase1";

export class FreLangChecker extends Checker<FreLanguage> {

    check(language: FreLanguage): void {
        const runner = new CheckRunner(this.errors, this.warnings);
        const phase1: FreLangCheckerPhase1 = new FreLangCheckerPhase1(language);
        phase1.check(language, runner);
        // now everything has been resolved, check that all concepts and interfaces have
        // unique names, that there are no circular inheritance or interface relationships,
        // and that all their properties are consistent with regard to inheritance
        const phase2: FreLangCheckerPhase2 = new FreLangCheckerPhase2(language);
        phase2.check(language, runner);
    }
}
