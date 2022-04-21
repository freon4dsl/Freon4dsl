import { ProjectItGeneratePartAction } from "./ProjectItGeneratePartAction";
import { MetaLogger } from "../utils/MetaLogger";
import { FreonTyperGenerator } from "../typerdef/generator/FreonTyperGenerator";
import { PiTyperMerger } from "../typerdef/parser/PiTyperMerger";

const LOGGER = new MetaLogger("ProjectItGenerateTyper"); // .mute();
export class ProjectItGenerateTyper extends ProjectItGeneratePartAction {
    protected typerGenerator: FreonTyperGenerator;

    public constructor() {
        super({
            actionName: "type-it",
            summary: "Generates the TypeScript code for the typer for your language",
            documentation: "Generates TypeScript code for the typer of language defined in the .ast file. The typer definition is found in the .type file."
        });
    }

    generate(): void {
        LOGGER.log("Starting ProjectIt typer generation ...");

        super.generate();
        this.typerGenerator = new FreonTyperGenerator();
        this.typerGenerator.language = this.language;
        this.typerGenerator.outputfolder = this.outputFolder;

        const typer = new PiTyperMerger(this.language).parseMulti(this.typerFiles);
        if (typer === null) {
            throw new Error("Typer definition could not be parsed, exiting.");
        }
        this.typerGenerator.generate(typer);
    }
}
