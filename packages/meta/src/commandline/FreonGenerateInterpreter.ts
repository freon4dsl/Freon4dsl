import { InterpreterGenerator } from "../interpretergen/generator/InterpreterGenerator.js";
import { FreInterpreterDef } from "../interpretergen/metalanguage/FreInterpreterDef.js";
import { FreonGeneratePartAction } from "./FreonGeneratePartAction.js";
import { MetaLogger } from "../utils/no-dependencies/index.js";

const LOGGER = new MetaLogger("FreonGenerateInterpreter").mute();

export class FreonGenerateInterpreter extends FreonGeneratePartAction {
    protected interpreterGenerator: InterpreterGenerator = new InterpreterGenerator();

    public constructor() {
        super({
            actionName: "interpret-it",
            summary: "Generates interpreter for your language",
            documentation: "Generates boilerplate code for a language interpreter from .eval files.",
        });
    }

    generate(): void {
        LOGGER.log("Starting Freon interpreter generation ...");
        super.generate();
        if (this.language === null || this.language === undefined) {
            return;
        }

        // read interpreter .eval file
        const interpeterDef = new FreInterpreterDef();
        for (const c of this.language.concepts) {
            interpeterDef.conceptsToEvaluate.push(c);
        }
        this.interpreterGenerator.outputFolder = this.outputFolder;
        this.interpreterGenerator.customsFolder = this.customsFolder;
        this.interpreterGenerator.language = this.language;
        this.interpreterGenerator.fileNames = this.languageFiles;
        this.interpreterGenerator.generate(interpeterDef);
    }
}
