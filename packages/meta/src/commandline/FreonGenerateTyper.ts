import { FreonGeneratePartAction } from "./FreonGeneratePartAction.js";
import { MetaLogger } from "../utils/no-dependencies/index.js";
import { FreonTyperGenerator } from "../typerdef/generator/FreonTyperGenerator.js";
import { FreTyperMerger } from "../typerdef/parser/FreTyperMerger.js";
import { TyperDef } from "../typerdef/metalanguage/index.js";
import { LOG2USER } from '../utils/basic-dependencies/index.js';
import { notNullOrUndefined } from '../utils/file-utils/index.js';

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
        super.generate();
        if (this.language === null || this.language === undefined) {
            return;
        }
        this.typerGenerator.language = this.language;
        this.typerGenerator.outputFolder = this.outputFolder;
        this.typerGenerator.customsFolder = this.customsFolder;

        try {
            if (this.typerFiles.length > 0) {
                const typer: TyperDef | undefined = new FreTyperMerger(this.language).parseMulti(this.typerFiles);
                if (notNullOrUndefined(typer)) {
                    this.typerGenerator.generate(typer);
                }
            } else {
                LOG2USER.info("No .type file(s) found.");
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                LOG2USER.error(
                  "Stopping typer generation because of errors: " + e.message + "\n" + e.stack,
                );
                // LOG2USER.error("Stopping editor, reader and writer generation because of errors: " + e.message);
            }
        }
    }
}
