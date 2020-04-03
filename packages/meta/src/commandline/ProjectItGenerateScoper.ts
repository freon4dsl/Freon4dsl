import { CommandLineStringParameter } from "@microsoft/ts-command-line";
import { ScoperGenerator } from "../scoperdef/generator/ScoperGenerator";
import { ScoperParser } from "../scoperdef/parser/ScoperParser";
import { ProjectItGeneratePartAction } from "./ProjectItGeneratePartAction";
import { PiLogger } from "../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("ProjectItGenerateScoper"); // .mute();
export class ProjectItGenerateScoper extends ProjectItGeneratePartAction {
    private scopeFile: CommandLineStringParameter;
    protected scoperGenerator: ScoperGenerator;

    public constructor() {
        super({
            actionName: "scope-it",
            summary: "Generates the TypeScript code for the scoper for your language",
            documentation: "Generates TypeScript code for the scoper of language defined in the .lang file. " + 
            "The scoper definition is found in the .scop file."
        });
    }

    generate(): void {
        LOGGER.log("Starting ProjectIt scoper generation ...");    
        super.generate();
        this.scoperGenerator = new ScoperGenerator(this.language);
        this.scoperGenerator.outputfolder = this.outputFolder;

        const scoper = new ScoperParser(this.language).parse(this.scopeFile.value);
        if (scoper == null) {
            LOGGER.error(this, "Scoper definition could not be parsed, exiting.");
            process.exit(-1);
        }
        this.scoperGenerator.generate(scoper);
        // TODO add check on succesfullness
    }

    protected onDefineParameters(): void {
        super.onDefineParameters();
        this.scopeFile = this.defineStringParameter({
            argumentName: "SCOPE",
            defaultValue: "LanguageDefinition.scop",
            parameterLongName: "--scope",
            parameterShortName: "-s",
            description: "Scope Definition file"
        });
    }
}
