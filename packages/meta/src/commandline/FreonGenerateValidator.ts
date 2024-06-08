import { LOG2USER } from "../utils/index";
import { ValidatorGenerator } from "../validatordef/generator/ValidatorGenerator";
import { ValidatorParser } from "../validatordef/parser/ValidatorParser";
import { FreonGeneratePartAction } from "./FreonGeneratePartAction";
import { MetaLogger } from "../utils/MetaLogger";

const LOGGER = new MetaLogger("FreonGenerateValidator"); // .mute();

export class FreonGenerateValidator extends FreonGeneratePartAction {
    protected validatorGenerator: ValidatorGenerator;

    public constructor() {
        super({
            actionName: "validate-it",
            summary: "Generates the TypeScript code for the validator for your language",
            documentation:
                "Generates TypeScript code for the validator of language defined in the .ast file. The validator definition is found in the .valid file."
        });
    }

    generate(): void {
        LOGGER.log("Starting Freon validator generation ...");

        super.generate();
        this.validatorGenerator = new ValidatorGenerator();
        this.validatorGenerator.language = this.language;
        this.validatorGenerator.outputfolder = this.outputFolder;

        const validator = new ValidatorParser(this.language).parseMulti(this.validFiles);
        if (validator === null) {
            throw new Error("Validator definition could not be parsed, cannot generate validator.");
        }
        try {
            this.validatorGenerator.generate(validator);
        } catch (e: unknown) {
            if (e instanceof Error) {
                LOG2USER.error("Stopping validator generation action because of errors: " + e.message + "\n" + e.stack);
            }
        }
    }
}
