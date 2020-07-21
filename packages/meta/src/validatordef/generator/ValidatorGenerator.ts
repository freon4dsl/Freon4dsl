import * as fs from "fs";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLanguage } from "../../languagedef/metalanguage";
import { GenerationStatus, Helpers, Names, VALIDATOR_FOLDER, VALIDATOR_GEN_FOLDER } from "../../utils";
import { PiValidatorDef } from "../metalanguage";
import { CheckerTemplate } from "./templates/CheckerTemplate";
import { ValidatorTemplate } from "./templates/ValidatorTemplate";

const LOGGER = new PiLogger("ValidatorGenerator"); //.mute();
export class ValidatorGenerator {
    public outputfolder: string = ".";
    public language: PiLanguage;
    protected validatorGenFolder: string;
    protected validatorFolder: string;

    constructor(language: PiLanguage) {
        this.language = language;
    }

    generate(validdef: PiValidatorDef): void {
        let generationStatus = new GenerationStatus();
        this.validatorFolder = this.outputfolder + "/" + VALIDATOR_FOLDER;
        this.validatorGenFolder = this.outputfolder + "/" + VALIDATOR_GEN_FOLDER;
        let name = validdef ? validdef.validatorName + " " : "";
        LOGGER.log("Generating validator: " + name + "in folder " + this.validatorGenFolder);

        const validator = new ValidatorTemplate();
        const checker = new CheckerTemplate();

        //Prepare folders
        Helpers.createDirIfNotExisting(this.validatorFolder);
        Helpers.createDirIfNotExisting(this.validatorGenFolder);
        Helpers.deleteFilesInDir(this.validatorGenFolder, generationStatus);

        // set relative path to get the imports right
        let relativePath = "../../";

        //  Generate validator
        LOGGER.log(`Generating validator: ${this.validatorGenFolder}/${Names.validator(this.language)}.ts`);
        var validatorFile = Helpers.pretty(validator.generateValidator(this.language, validdef, relativePath), "Validator Class", generationStatus);
        fs.writeFileSync(`${this.validatorGenFolder}/${Names.validator(this.language)}.ts`, validatorFile);

        //  Generate checker
        if (validdef !== null && validdef !== undefined) {
            LOGGER.log(`Generating checker: ${this.validatorGenFolder}/${Names.checker(this.language)}.ts`);
            var checkerFile = Helpers.pretty(checker.generateChecker(this.language, validdef, relativePath), "Checker Class", generationStatus);
            fs.writeFileSync(`${this.validatorGenFolder}/${Names.checker(this.language)}.ts`, checkerFile);
        }

        LOGGER.log(`Generating validator gen index: ${this.validatorGenFolder}/index.ts`);
        var indexFile = Helpers.pretty(validator.generateIndex(this.language, validdef), "Index Class", generationStatus);
        fs.writeFileSync(`${this.validatorGenFolder}/index.ts`, indexFile);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.info(this, `Generated validator '${name}' with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(this, `Succesfully generated validator ${name}`);
        }
    }
}
