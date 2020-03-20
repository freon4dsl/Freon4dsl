import { CommandLineStringParameter } from "@microsoft/ts-command-line";
import { ProjectItGeneratePartAction } from "./ProjectItGeneratePartAction";
import { PiLogger } from "../../../core/src/util/PiLogging";
import { PiTyperGenerator } from "../typerdef/generator/PiTyperGenerator";
import { PiTyperParser } from "../typerdef/parser/PiTyperParser";

const LOGGER = new PiLogger("ProjectItGenerateTyper"); // .mute();
export class ProjectItGenerateTyper extends ProjectItGeneratePartAction {
    private typerdefFile: CommandLineStringParameter;
    protected typerGenerator: PiTyperGenerator;

    public constructor() {
        super({
            actionName: "generate-typer",
            summary: "Generates the TypeScript code for the typer for your language",
            documentation: "Generates TypeScript code for the typer of language defined in the .lang file. The typer definition is found in the .type file."
        });
    }

    generate(): void {
        if (this.verbose) {
            LOGGER.log("Starting ProjectIt typer generation ...");    
        }
        super.generate();
        this.typerGenerator = new PiTyperGenerator(this.language);
        this.typerGenerator.outputfolder = this.outputFolder;

        const typer = new PiTyperParser(this.language).parse(this.typerdefFile.value);
        if (typer == null) {
            LOGGER.error(this, "Typer definiton could not be parsed, exiting.");
            process.exit(-1);
        }
        // this.typerGenerator.generate(typer, this.verbose);
        // TODO add check on succesfullness
    }

    protected onDefineParameters(): void {
        super.onDefineParameters();
        this.typerdefFile = this.defineStringParameter({
            argumentName: "TYPES",
            defaultValue: "LanguageDefinition.type",
            parameterLongName: "--typer",
            parameterShortName: "-t",
            description: "Typer Definition file"
        });
    }
}
