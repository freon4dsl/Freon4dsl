import { InterpreterGenerator } from "../interpretergen/InterpreterGenerator";
import { ProjectItGeneratePartAction } from "./ProjectItGeneratePartAction";
import { MetaLogger } from "../utils/MetaLogger";

const LOGGER = new MetaLogger("ProjectItGenerateInterpreter").mute();

export class ProjectItGenerateInterpreter extends ProjectItGeneratePartAction {
    protected interpreterGenerator: InterpreterGenerator = new InterpreterGenerator();

    public constructor() {
        super({
            actionName: "interpret-it",
            summary: "Generates interpreter for your language",
            documentation: "Generates boilerplate code for a language interpreter from .eval files."
        });
    }

    generate(): void {
        LOGGER.log("Starting ProjectIt interpreter generation ...");
        super.generate();

        this.interpreterGenerator.outputfolder = this.outputFolder;
        this.interpreterGenerator.language = this.language;

        this.interpreterGenerator.fileNames = this.languageFiles;
        this.interpreterGenerator.generate();
    }
}
