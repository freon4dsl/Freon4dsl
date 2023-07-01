import { CheckRunner } from "./CheckRunner";
import { FreMetaLanguage } from "../../languagedef/metalanguage";

export abstract class CheckerPhase<DEFINITION> {
    language: FreMetaLanguage; // should be set in every checker phase, except the checker for the language definition language (.ast)
    runner: CheckRunner;

    constructor(language: FreMetaLanguage) {
        this.language = language;
    }

    public check(lang: DEFINITION, runner: CheckRunner): void {
        this.runner = runner;
    }
}
