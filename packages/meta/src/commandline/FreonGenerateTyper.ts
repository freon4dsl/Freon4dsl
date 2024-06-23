import { FreonGeneratePartAction } from "./FreonGeneratePartAction";
import { MetaLogger } from "../utils/MetaLogger";
import { FreonTyperGenerator } from "../typerdef/generator/FreonTyperGenerator";
import { FreTyperMerger } from "../typerdef/parser/FreTyperMerger";
import {TyperDef} from "../typerdef/metalanguage";

const LOGGER = new MetaLogger("FreonGenerateTyper"); // .mute();
export class FreonGenerateTyper extends FreonGeneratePartAction {
    protected typerGenerator: FreonTyperGenerator;

    public constructor() {
        super({
            actionName: "type-it",
            summary: "Generates the TypeScript code for the typer for your language",
            documentation: "Generates TypeScript code for the typer of language defined in the .ast file. The typer definition is found in the .type file."
        });
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

        const typer: TyperDef = new FreTyperMerger(this.language).parseMulti(this.typerFiles);
        if (typer === null) {
            throw new Error("Typer definition could not be parsed, exiting.");
        }
        this.typerGenerator.generate(typer);
    }
}
