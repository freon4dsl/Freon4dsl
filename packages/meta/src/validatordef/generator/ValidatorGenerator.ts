import * as fs from "fs";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLanguageUnit } from "../../languagedef/metalanguage";
import { Helpers, Names, VALIDATOR_FOLDER, VALIDATOR_GEN_FOLDER } from "../../utils";
import { PiValidatorDef } from "../metalanguage";
import { CheckerTemplate } from "./templates/CheckerTemplate";
import { ValidatorTemplate } from "./templates/ValidatorTemplate";

const LOGGER = new PiLogger("ValidatorGenerator").mute();
export class ValidatorGenerator {
    public outputfolder: string = ".";
    public language: PiLanguageUnit;
    protected validatorGenFolder: string;
    protected validatorFolder: string;

    constructor(language: PiLanguageUnit) {
        this.language = language;
    }

    generate(validdef: PiValidatorDef): void {
        this.validatorFolder = this.outputfolder + "/" + VALIDATOR_FOLDER;
        this.validatorGenFolder = this.outputfolder + "/" + VALIDATOR_GEN_FOLDER;
        let name = validdef? validdef.validatorName + " " : "";
        LOGGER.log("Generating validator: " + name + "in folder " + this.validatorGenFolder);

        const validator = new ValidatorTemplate();
        const checker = new CheckerTemplate();

        //Prepare folders
        Helpers.createDirIfNotExisting(this.validatorFolder);
        Helpers.createDirIfNotExisting(this.validatorGenFolder);
        Helpers.deleteFilesInDir(this.validatorGenFolder);

        // set relative path to get the imports right
        let relativePath = "../../";

        //  Generate validator
        LOGGER.log("Generating validator class");
        var validatorFile = Helpers.pretty(validator.generateValidator(this.language, validdef, relativePath), "Validator Class");
        fs.writeFileSync(`${this.validatorGenFolder}/${Names.validator(this.language)}.ts`, validatorFile);

        //  Generate checker
        if (validdef !== null) {
            LOGGER.log("Generating checker class");
            var checkerFile = Helpers.pretty(checker.generateChecker(this.language, validdef, relativePath), "Checker Class");
            fs.writeFileSync(`${this.validatorGenFolder}/${Names.checker(this.language)}.ts`, checkerFile);
        }

        LOGGER.log("Generating validator index class");
        var indexFile = Helpers.pretty(validator.generateIndex(this.language, validdef), "Index Class");
        fs.writeFileSync(`${this.validatorGenFolder}/index.ts`, indexFile);

        LOGGER.log("Succesfully generated validator: " + name);
    } 
}
