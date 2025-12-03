import { Checker, CheckRunner } from "../../utils/basic-dependencies/index.js";
import { FreMetaLanguage } from "../metalanguage/index.js";
import { FreLangCheckerPhase2 } from "./FreLangCheckerPhase2.js";
import { FreLangCheckerPhase1 } from "./FreLangCheckerPhase1.js";

export class FreLangChecker extends Checker<FreMetaLanguage> {
    check(language: FreMetaLanguage): void {
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
