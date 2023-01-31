import { ICommandLineActionOptions } from "@rushstack/ts-command-line";
import { LanguageParser } from "../languagedef/parser/LanguageParser";
import { ProjectItGenerateAction } from "./ProjectitGenerateAction";
import { FreLanguage } from "../languagedef/metalanguage/FreLanguage";

/**
 * Generic generator action for generating part of the language, e.g. only the typer.
 * The only option defined here is the -d flag for the folder where the definition files can be found.
 * Subclasses need to call super.generate().
 */
export class ProjectItGeneratePartAction extends ProjectItGenerateAction {
    protected language: FreLanguage;

    public constructor(options: ICommandLineActionOptions) {
        super(options);
    }

    generate(): void {
        this.findDefinitionFiles();
        // we only read the .ast files, no need to generate.
        // the actual generation, when needed, is done by subclasses.
        this.language = new LanguageParser().parseMulti(this.languageFiles);
        if (this.language === null) {
            throw new Error("Language could not be parsed, exiting.");
        }
    }
}
