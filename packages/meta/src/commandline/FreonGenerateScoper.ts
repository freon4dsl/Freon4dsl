import { ScoperGenerator } from "../scoperdef/generator/ScoperGenerator.js";
import { ScoperParser } from "../scoperdef/parser/ScoperParser.js";
import { FreonGeneratePartAction } from "./FreonGeneratePartAction.js";
import { MetaLogger } from "../utils/no-dependencies/index.js";
import { ScopeDef } from "../scoperdef/metalanguage/index.js";
import { LOG2USER } from '../utils/basic-dependencies/index.js';
import { notNullOrUndefined } from '../utils/file-utils/index.js';

const LOGGER = new MetaLogger("FreonGenerateScoper"); // .mute();
export class FreonGenerateScoper extends FreonGeneratePartAction {
    protected scoperGenerator: ScoperGenerator;

    public constructor() {
        super({
            actionName: "scope-it",
            summary: "Generates the TypeScript code for the scoper for your language",
            documentation:
                "Generates TypeScript code for the scoper of language defined in the .ast files. " +
                "The scoper definition is found in the .scope files.",
        });
        this.scoperGenerator = new ScoperGenerator();
    }

    generate(): void {
        LOGGER.log("Starting Freon scoper generation ...");
        super.generate();
        if (this.language === null || this.language === undefined) {
            return;
        }
        this.scoperGenerator.language = this.language;
        this.scoperGenerator.outputfolder = this.outputFolder;
        this.scoperGenerator.customsfolder = this.customsFolder;
        try {
            if (this.scopeFiles.length > 0) {
                const scoper: ScopeDef | undefined = new ScoperParser(this.language).parseMulti(this.scopeFiles);
                if (notNullOrUndefined(scoper)) {
                    this.scoperGenerator.generate(scoper);
                }
            } else {
                LOG2USER.info("No .scope file(s) found.");
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
