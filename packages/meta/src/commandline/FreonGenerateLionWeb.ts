import { LionWebGenerator } from "../lionwebgen/LionWebGenerator.js";
import { MetaLogger } from "../utils/no-dependencies/index.js";
import { FreonGeneratePartAction } from "./FreonGeneratePartAction.js";

const LOGGER = new MetaLogger("FreonGenerateInterpreter").mute();

export class FreonGenerateLionWeb extends FreonGeneratePartAction {
    protected lionWebGenerator: LionWebGenerator = new LionWebGenerator();

    public constructor() {
        super({
            actionName: "lionweb-it",
            summary: "Generates LionWeb for your language",
            documentation: "Generates LionWeb language definition in JSON format.",
        });
    }

    generate(): void {
        LOGGER.log("Starting Freon LionWeb generation ...");
        super.generate();
        if (this.language === null || this.language === undefined) {
            return;
        }

        // read interpreter .eval file
        this.lionWebGenerator.outputfolder = this.outputFolder;
        this.lionWebGenerator.customsfolder = this.customsFolder;
        this.lionWebGenerator.language = this.language;
        this.lionWebGenerator.generate();
    }
}
