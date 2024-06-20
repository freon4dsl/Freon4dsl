import { FreMetaLanguage } from "../../languagedef/metalanguage";

export abstract class Checker<DEFINITION> {
    language: FreMetaLanguage; // should be set in every checker, except the checker for the language definition language (.ast)
    errors: string[] = [];
    warnings: string[] = [];

    constructor(language: FreMetaLanguage) {
        this.language = language;

    }

    public abstract check(lang: DEFINITION): void;

    public hasErrors(): boolean {
        return this.errors.length > 0;
    }

    public hasWarnings(): boolean {
        return this.warnings.length > 0;
    }
}
