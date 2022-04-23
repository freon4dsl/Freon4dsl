import { CheckRunner } from "./CheckRunner";
import { PiLanguage } from "../../languagedef/metalanguage";

export abstract class CheckerPhase<DEFINITION> {
    language: PiLanguage; // should be set in every checker phase, except the checker for the language definition language (.ast)
    runner: CheckRunner;

    constructor(language: PiLanguage) {
        this.language = language;
    }

    public check(lang: DEFINITION, runner: CheckRunner): void {
        this.runner = runner;
    }
}
