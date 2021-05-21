import { ValidatorGenerator } from "../validatordef/generator/ValidatorGenerator";
import { ValidatorParser } from "../validatordef/parser/ValidatorParser";
import { ProjectItGeneratePartAction } from "./ProjectItGeneratePartAction";
import { MetaLogger } from "../utils/MetaLogger";

const LOGGER = new MetaLogger("ProjectItGenerateValidator"); // .mute();

export class ProjectItGenerateValidator extends ProjectItGeneratePartAction {
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
        LOGGER.log("Starting ProjectIt validator generation ...");

        super.generate();
        this.validatorGenerator = new ValidatorGenerator(this.language);
        this.validatorGenerator.outputfolder = this.outputFolder;

        const validator = new ValidatorParser(this.language).parseMulti(this.validFiles);
        if (validator === null) {
            throw new Error("Validator definition could not be parsed, cannot generate validator.");
        }
        this.validatorGenerator.generate(validator);
    }
}
