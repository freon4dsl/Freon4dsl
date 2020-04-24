import { CommandLineStringParameter } from "@microsoft/ts-command-line";
import { ValidatorGenerator } from "../validatordef/generator/ValidatorGenerator";
import { ValidatorParser } from "../validatordef/parser/ValidatorParser";
import { ProjectItGeneratePartAction } from "./ProjectItGeneratePartAction";
import { PiLogger } from "../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("ProjectItGenerateValidator"); // .mute();
export class ProjectItGenerateValidator extends ProjectItGeneratePartAction {
    private validdefFile: CommandLineStringParameter;
    protected validatorGenerator: ValidatorGenerator;

    public constructor() {
        super({
            actionName: "validate-it",
            summary: "Generates the TypeScript code for the validator for your language",
            documentation:
                "Generates TypeScript code for the validator of language defined in the .lang file. The validator definition is found in the .valid file."
        });
    }

    generate(): void {
        LOGGER.log("Starting ProjectIt validator generation ...");

        super.generate();
        this.validatorGenerator = new ValidatorGenerator(this.language);
        this.validatorGenerator.outputfolder = this.outputFolder;

        const validator = new ValidatorParser(this.language).parse(this.validdefFile.value);
        if (validator == null) {
            throw new Error("Validator definition could not be parsed, cannot generate validator.");
        }
        this.validatorGenerator.generate(validator);
        // TODO add check on succesfullness
    }

    protected onDefineParameters(): void {
        super.onDefineParameters();
        this.validdefFile = this.defineStringParameter({
            argumentName: "VALIDATE",
            defaultValue: "LanguageDefinition.valid",
            parameterLongName: "--checker",
            parameterShortName: "-c",
            description: "Validation Definition file"
        });
    }
}
