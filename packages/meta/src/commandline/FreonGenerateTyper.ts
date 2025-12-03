import { FreonGeneratePartAction } from "./FreonGeneratePartAction.js";
import { MetaLogger } from "../utils/no-dependencies/index.js";
import { FreonTyperGenerator } from "../typerdef/generator/FreonTyperGenerator.js";
import { FreTyperMerger } from "../typerdef/parser/FreTyperMerger.js";
import { TyperDef } from "../typerdef/metalanguage/index.js";

const LOGGER = new MetaLogger("FreonGenerateTyper"); // .mute();
export class FreonGenerateTyper extends FreonGeneratePartAction {
    protected typerGenerator: FreonTyperGenerator;

    public constructor() {
        super({
            actionName: "type-it",
            summary: "Generates the TypeScript code for the typer for your language",
            documentation:
                "Generates TypeScript code for the typer of language defined in the .ast file. The typer definition is found in the .type file.",
        });
        this.typerGenerator = new FreonTyperGenerator();
    }

    generate(): void {
        LOGGER.log("Starting Freon typer generation ...");
        if (this.language === null || this.language === undefined) {
            return;
        }
        super.generate();
        this.typerGenerator = new FreonTyperGenerator();
        this.typerGenerator.language = this.language;
        this.typerGenerator.outputfolder = this.outputFolder;

        const typer: TyperDef | undefined = new FreTyperMerger(this.language).parseMulti(this.typerFiles);
        if (typer === null || typer === undefined) {
            throw new Error("Typer definition could not be parsed, exiting.");
        } else {
            this.typerGenerator.generate(typer);
        }
    }
}
