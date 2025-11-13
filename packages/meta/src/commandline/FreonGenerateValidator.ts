import { LOG2USER } from "../utils/basic-dependencies/index.js";
import { ValidatorGenerator } from "../validatordef/generator/ValidatorGenerator.js";
import { ValidatorParser } from "../validatordef/parser/ValidatorParser.js";
import { FreonGeneratePartAction } from "./FreonGeneratePartAction.js";
import { MetaLogger } from "../utils/no-dependencies/index.js";
import { ValidatorDef } from "../validatordef/metalanguage/index.js";
import { notNullOrUndefined } from '../utils/file-utils/index.js';

const LOGGER = new MetaLogger("FreonGenerateValidator"); // .mute();

export class FreonGenerateValidator extends FreonGeneratePartAction {
    protected validatorGenerator: ValidatorGenerator;

    public constructor() {
        super({
            actionName: "validate-it",
            summary: "Generates the TypeScript code for the validator for your language",
            documentation:
                "Generates TypeScript code for the validator of language defined in the .ast file. The validator definition is found in the .valid file.",
        });
        this.validatorGenerator = new ValidatorGenerator();
    }

    generate(): void {
        LOGGER.log("Starting Freon validator generation ...");
        super.generate();
        if (this.language === null || this.language === undefined) {
            return;
        }
        this.validatorGenerator.language = this.language;
        this.validatorGenerator.outputfolder = this.outputFolder;
        this.validatorGenerator.customsfolder = this.customsFolder;

        try {
            if (this.validFiles.length > 0) {
                const validator: ValidatorDef | undefined = new ValidatorParser(this.language).parseMulti(this.validFiles);
                if (notNullOrUndefined(validator)) {
                    this.validatorGenerator.generate(validator);
                }
            } else {
                LOG2USER.info("No .valid file(s) found.");
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                LOG2USER.error("Stopping validator generation action because of errors: " + e.message + "\n" + e.stack);
            }
        }
    }
}
