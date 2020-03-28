import { Helpers } from "../../utils/Helpers";
import { PiLanguageUnit } from "../../languagedef/metalanguage/PiLanguage";
import * as fs from "fs";
import { VALIDATOR_FOLDER, VALIDATOR_GEN_FOLDER } from "../../utils/GeneratorConstants";
import { Names } from "../../utils/Names";
import { ValidatorTemplate } from "./templates/ValidatorTemplate";
import { PiValidatorDef } from "../metalanguage/ValidatorDefLang";
import { CheckerTemplate } from "./templates/CheckerTemplate";
import { PiLogger } from "../../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("ValidatorGenerator"); // .mute();
export class ValidatorGenerator {
    public outputfolder: string = ".";
    public language: PiLanguageUnit;
    protected validatorGenFolder: string;
    protected validatorFolder: string;

    constructor(language: PiLanguageUnit) {
        this.language = language;
    }

    generate(validdef: PiValidatorDef, verbose?: boolean): void {
        this.validatorFolder = this.outputfolder + "/" + VALIDATOR_FOLDER;
        this.validatorGenFolder = this.outputfolder + "/" + VALIDATOR_GEN_FOLDER;
        if (verbose) LOGGER.log("Generating validator: " + validdef.validatorName + " in folder " + this.validatorGenFolder);

        const validator = new ValidatorTemplate();
        const checker = new CheckerTemplate();

        //Prepare folders
        Helpers.createDirIfNotExisting(this.validatorFolder, verbose);
        Helpers.createDirIfNotExisting(this.validatorGenFolder, verbose);

        // set relative path for imports
        this.outputfolder = "../../../../" + this.outputfolder;

        //  Generate validator
        if (verbose) LOGGER.log("Generating validator class");
        var validatorFile = Helpers.pretty(validator.generateValidator(this.language, validdef, this.outputfolder), "Validator Class", verbose);
        fs.writeFileSync(`${this.validatorGenFolder}/${Names.validator(this.language, validdef)}.ts`, validatorFile);

        //  Generate checker
        if (verbose) LOGGER.log("Generating checker class");
        var checkerFile = Helpers.pretty(checker.generateChecker(this.language, validdef, this.outputfolder), "Checker Class", verbose);
        fs.writeFileSync(`${this.validatorGenFolder}/${Names.checker(this.language, validdef)}.ts`, checkerFile);

        if (verbose) LOGGER.log("Succesfully generated validator: " + validdef.validatorName);
    } 
}
