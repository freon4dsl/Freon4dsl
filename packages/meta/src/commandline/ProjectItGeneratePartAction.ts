import { CommandLineStringParameter, ICommandLineActionOptions } from "@microsoft/ts-command-line";
import { LanguageParser } from "../languagedef/parser/LanguageParser";
import { ProjectItGenerateAction } from "./ProjectitGenerateAction";
import { PiLanguage } from "../languagedef/metalanguage/PiLanguage";
import { PiLogger } from "../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("ProjectItGeneratePartAction"); // .mute();
/**
 * Generic generator action for generating part of the language, e.g. only the typer.
 * The only option defined here is the -l flag for the language file.
 * Subclasses need to call super.generate().
 */
export class ProjectItGeneratePartAction extends ProjectItGenerateAction {
    private languageFileArg: CommandLineStringParameter;
    protected languageFile: string;
    protected language: PiLanguage;
    protected succesfull: boolean = true;

    public constructor(options: ICommandLineActionOptions) {
        super(options);
    }

    generate(): void {
        // TODO adjust this to multi file arguments
        this.languageFile = this.languageFileArg.value;
        // we only read the .lang file, no need to generate
        // the actual generation, when needed, is done by subclasses
        this.language = new LanguageParser().parse(this.languageFile);
        if (this.language === null) {
            throw new Error("Language could not be parsed, exiting.");
        }
    }

    protected onDefineParameters(): void {
        super.onDefineParameters();
        this.languageFileArg = this.defineStringParameter({
            argumentName: "LANGUAGE",
            defaultValue: "LanguageDefinition.lang",
            parameterLongName: "--language",
            parameterShortName: "-l",
            description: "Language Definition file",
            required: false
        });
    }
}
