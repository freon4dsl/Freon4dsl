import { Helpers } from "../../utils/Helpers";
import { PiLanguage } from "../../languagedef/metalanguage/PiLanguage";
import * as fs from "fs";
import { VALIDATOR_FOLDER, VALIDATOR_GEN_FOLDER } from "../../utils/GeneratorConstants";
import { Names } from "../../utils/Names";
import { ValidatorTemplate } from "./templates/ValidatorTemplate";
import { PiValidatorDef } from "../metalanguage/PiValidatorDefLang";

export class ValidatorGenerator {
    public outputfolder: string = ".";
    public language: PiLanguage;
    protected validatorGenFolder: string;
    protected validatorFolder: string;

    constructor(language: PiLanguage) {
        this.language = language;
    }

    generate(validdef: PiValidatorDef): void {
        console.log("Start validator generator");

        const validator = new ValidatorTemplate();

        //Prepare folders
        this.validatorFolder = this.outputfolder + "/" + VALIDATOR_FOLDER;
        this.validatorGenFolder = this.outputfolder + "/" + VALIDATOR_GEN_FOLDER;
        Helpers.createDirIfNotExisting(this.validatorFolder);
        Helpers.createDirIfNotExisting(this.validatorGenFolder);

        //  Generate it
        var validatorFile = Helpers.pretty(validator.generateValidator(this.language, validdef), "Validator Class");
        fs.writeFileSync(`${this.validatorGenFolder}/${Names.validator(this.language, validdef)}.ts`, validatorFile);

    } 
}
