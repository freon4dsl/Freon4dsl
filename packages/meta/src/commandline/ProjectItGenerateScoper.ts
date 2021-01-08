import { CommandLineStringParameter } from "@rushstack/ts-command-line";
import { ScoperGenerator } from "../scoperdef/generator/ScoperGenerator";
import { ScoperParser } from "../scoperdef/parser/ScoperParser";
import { ProjectItGeneratePartAction } from "./ProjectItGeneratePartAction";
import { MetaLogger } from "../utils/MetaLogger";

const LOGGER = new MetaLogger("ProjectItGenerateScoper"); // .mute();
export class ProjectItGenerateScoper extends ProjectItGeneratePartAction {
    private scopeFile: CommandLineStringParameter;
    protected scoperGenerator: ScoperGenerator;

    public constructor() {
        super({
            actionName: "scope-it",
            summary: "Generates the TypeScript code for the scoper for your language",
            documentation:
                "Generates TypeScript code for the scoper of language defined in the .lang file. " + "The scoper definition is found in the .scop file."
        });
    }

    generate(): void {
        // LOGGER.log("Starting ProjectIt scoper generation ...");
        super.generate();
        this.scoperGenerator = new ScoperGenerator(this.language);
        this.scoperGenerator.outputfolder = this.outputFolder;

        const scoper = new ScoperParser(this.language).parse(this.scopeFile.value);
        if (scoper === null) {
            throw new Error("Scoper definition could not be parsed, exiting.");
        }
        this.scoperGenerator.generate(scoper);
        // TODO add check on succesfullness
    }

    protected onDefineParameters(): void {
        super.onDefineParameters();
        this.scopeFile = this.defineStringParameter({
            argumentName: "SCOPE",
            defaultValue: "LanguageDefinition.scope",
            parameterLongName: "--scope",
            parameterShortName: "-s",
            description: "Scope Definition file"
        });
    }
}
