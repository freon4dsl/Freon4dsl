import { ScoperGenerator } from "../scoperdef/generator/ScoperGenerator";
import { ScoperParser } from "../scoperdef/parser/ScoperParser";
import { FreonGeneratePartAction } from "./FreonGeneratePartAction";
import { MetaLogger } from "../utils/MetaLogger";
import {ScopeDef} from "../scoperdef/metalanguage";

const LOGGER = new MetaLogger("FreonGenerateScoper"); // .mute();
export class FreonGenerateScoper extends FreonGeneratePartAction {
    protected scoperGenerator: ScoperGenerator;

    public constructor() {
        super({
            actionName: "scope-it",
            summary: "Generates the TypeScript code for the scoper for your language",
            documentation:
                "Generates TypeScript code for the scoper of language defined in the .ast files. " + "The scoper definition is found in the .scope files."
        });
    }

    generate(): void {
        LOGGER.log("Starting Freon scoper generation ...");
        super.generate();
        if (this.language === null || this.language === undefined) {
            return;
        }
        this.scoperGenerator = new ScoperGenerator();
        this.scoperGenerator.language = this.language;
        this.scoperGenerator.outputfolder = this.outputFolder;

        const scoper: ScopeDef | undefined = new ScoperParser(this.language).parseMulti(this.scopeFiles);
        if (scoper === null || scoper === undefined) {
            throw new Error("Scoper definition could not be parsed, exiting.");
        }
        this.scoperGenerator.generate(scoper);
    }
}
