import { InterpreterGenerator } from "../interpretergen/generator/InterpreterGenerator";
import { FreInterpreterDef } from "../interpretergen/metalanguage/FreInterpreterDef";
import { FreonGeneratePartAction } from "./FreonGeneratePartAction";
import { MetaLogger } from "../utils/MetaLogger";

const LOGGER = new MetaLogger("FreonGenerateInterpreter").mute();

export class FreonGenerateInterpreter extends FreonGeneratePartAction {
    protected interpreterGenerator: InterpreterGenerator  = new InterpreterGenerator();

    public constructor() {
        super({
            actionName: "interpret-it",
            summary: "Generates interpreter for your language",
            documentation: "Generates boilerplate code for a language interpreter from .eval files."
        });
    }

    generate(): void {
        LOGGER.log("Starting Freon interpreter generation ...");
        super.generate();

        // read interpreter .eval file
        const interpeterDef = new FreInterpreterDef();
        for (const c of this.language.concepts) {
            interpeterDef.conceptsToEvaluate.push(c);
        }
        this.interpreterGenerator.outputfolder = this.outputFolder;
        this.interpreterGenerator.language = this.language;


        this.interpreterGenerator.fileNames = this.languageFiles;
        this.interpreterGenerator.generate(interpeterDef);
    }
}
