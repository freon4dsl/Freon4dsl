import { Helpers } from "../../utils/Helpers";
import { PiLanguageUnit } from "../../languagedef/metalanguage/PiLanguage";
import * as fs from "fs";
import { VALIDATOR_FOLDER, VALIDATOR_GEN_FOLDER } from "../../utils/GeneratorConstants";
import { Names } from "../../utils/Names";
import { ValidatorTemplate } from "./templates/ValidatorTemplate";
import { PiValidatorDef } from "../metalanguage/ValidatorDefLang";
import { CheckerTemplate } from "./templates/CheckerTemplate";

export class ValidatorGenerator {
    public outputfolder: string = ".";
    public language: PiLanguageUnit;
    protected validatorGenFolder: string;
    protected validatorFolder: string;

    constructor(language: PiLanguageUnit) {
        this.language = language;
    }

    generate(validdef: PiValidatorDef): void {
        console.log("Generating validator:" + validdef?.validatorName);

        const validator = new ValidatorTemplate();
        const checker = new CheckerTemplate();

        //Prepare folders
        this.validatorFolder = this.outputfolder + "/" + VALIDATOR_FOLDER;
        this.validatorGenFolder = this.outputfolder + "/" + VALIDATOR_GEN_FOLDER;
        Helpers.createDirIfNotExisting(this.validatorFolder);
        Helpers.createDirIfNotExisting(this.validatorGenFolder);

        //  Generate validator
        var validatorFile = Helpers.pretty(validator.generateValidator(this.language, validdef), "Validator Class");
        fs.writeFileSync(`${this.validatorGenFolder}/${Names.validator(this.language, validdef)}.ts`, validatorFile);

        //  Generate checker
        var checkerFile = Helpers.pretty(checker.generateChecker(this.language, validdef), "Checker Class");
        fs.writeFileSync(`${this.validatorGenFolder}/${Names.checker(this.language, validdef)}.ts`, checkerFile);

        console.log("Succesfully generated validator: " + validdef?.validatorName);
    } 
}
