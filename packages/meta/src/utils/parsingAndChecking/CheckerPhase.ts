import { CheckRunner } from "./CheckRunner";
import { FreMetaLanguage } from "../../languagedef/metalanguage";

export abstract class CheckerPhase<DEFINITION> {
    language: FreMetaLanguage; // should be set in every checker phase, except the checker for the language definition language (.ast)
    runner: CheckRunner;

    constructor(language: FreMetaLanguage) {
        this.language = language;
        // The following object is never used. This property is set to the correct value in the 'check' method.
        // However, to avoid "TS2564: Property runner has no initializer and is not definitely assigned in the constructor.",
        // this statement is included in the constructor.
        this.runner = new CheckRunner([], []);
    }

    // @ts-ignore
    // error TS6133: 'lang' is declared but its value is never read.
    // This error is ignored because this parameter is only used by subclasses of CheckerPhase.
    public check(lang: DEFINITION, runner: CheckRunner): void {
        this.runner = runner;
    }
}
