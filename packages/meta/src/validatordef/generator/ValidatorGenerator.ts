import { Helpers } from "../../utils/Helpers";
import { PiLanguageUnit } from "../../languagedef/metalanguage/PiLanguage";
import * as fs from "fs";
import { VALIDATOR_FOLDER, VALIDATOR_GEN_FOLDER } from "../../utils/GeneratorConstants";
import { Names } from "../../utils/Names";
import { ValidatorTemplate } from "./templates/ValidatorTemplate";
import { ValidatorDef } from "../metalanguage/ValidatorDefLang";

export class ValidatorGenerator {
    public outputfolder: string = ".";
    public language: PiLanguageUnit;
    protected validatorGenFolder: string;
    protected validatorFolder: string;

    constructor(language: PiLanguageUnit) {
        this.language = language;
    }

    generate(validdef: ValidatorDef): void {
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
