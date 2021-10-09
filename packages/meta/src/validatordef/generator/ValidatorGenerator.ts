import * as fs from "fs";
import { MetaLogger } from "../../utils/MetaLogger";
import { PiLanguage } from "../../languagedef/metalanguage";
import { GenerationStatus, Helpers, Names, VALIDATOR_FOLDER, VALIDATOR_GEN_FOLDER } from "../../utils";
import { PiValidatorDef } from "../metalanguage";
import { RulesCheckerTemplate } from "./templates/RulesCheckerTemplate";
import { ValidatorTemplate } from "./templates/ValidatorTemplate";
import { ReservedWordsTemplate } from "./templates/ReservedWordsTemplate";
import { NonOptionalsCheckerTemplate } from "./templates/NonOptionalsCheckerTemplate";
import { ReferenceCheckerTemplate } from "./templates/ReferenceCheckerTemplate";

const LOGGER = new MetaLogger("ValidatorGenerator").mute();
export class ValidatorGenerator {
    public outputfolder: string = ".";
    public language: PiLanguage;
    protected validatorGenFolder: string;
    protected validatorFolder: string;

    constructor(language: PiLanguage) {
        this.language = language;
    }

    generate(validdef: PiValidatorDef): void {
        const generationStatus = new GenerationStatus();
        this.validatorFolder = this.outputfolder + "/" + VALIDATOR_FOLDER;
        this.validatorGenFolder = this.outputfolder + "/" + VALIDATOR_GEN_FOLDER;
        const name = validdef ? validdef.validatorName + " " : "default";
        LOGGER.log("Generating validator: " + name + "in folder " + this.validatorGenFolder);

        const validatorTemplate = new ValidatorTemplate();
        const nonOptionalsCheckerTemplate = new NonOptionalsCheckerTemplate();
        const referenceCheckerTemplate = new ReferenceCheckerTemplate();
        const checkerTemplate = new RulesCheckerTemplate();
        const reservedWordsTemplate = new ReservedWordsTemplate();

        // Prepare folders
        Helpers.createDirIfNotExisting(this.validatorFolder);
        Helpers.createDirIfNotExisting(this.validatorGenFolder);
        Helpers.deleteFilesInDir(this.validatorGenFolder, generationStatus);

        // set relative path to get the imports right
        const relativePath = "../../";

        //  Generate validator
        LOGGER.log(`Generating validator: ${this.validatorGenFolder}/${Names.validator(this.language)}.ts`);
        const validatorFile = Helpers.pretty(validatorTemplate.generateValidator(this.language, validdef, relativePath),
            "Validator Class", generationStatus);
        fs.writeFileSync(`${this.validatorGenFolder}/${Names.validator(this.language)}.ts`, validatorFile);

        // generate the default checker on non-optional properties
        LOGGER.log(`Generating checker for non-optional parts: ${this.validatorGenFolder}/${Names.nonOptionalsChecker(this.language)}.ts`);
        let checkerFile = Helpers.pretty(nonOptionalsCheckerTemplate.generateChecker(this.language, relativePath),
            "Non-optionals Checker Class", generationStatus);
        fs.writeFileSync(`${this.validatorGenFolder}/${Names.nonOptionalsChecker(this.language)}.ts`, checkerFile);

        // generate the default checker for references
        LOGGER.log(`Generating checker for references: ${this.validatorGenFolder}/${Names.referenceChecker(this.language)}.ts`);
        checkerFile = Helpers.pretty(referenceCheckerTemplate.generateChecker(this.language, relativePath),
            "Reference Checker Class", generationStatus);
        fs.writeFileSync(`${this.validatorGenFolder}/${Names.referenceChecker(this.language)}.ts`, checkerFile);

        //  Generate checker
        if (validdef !== null && validdef !== undefined) {
            LOGGER.log(`Generating rules checker: ${this.validatorGenFolder}/${Names.rulesChecker(this.language)}.ts`);
            checkerFile = Helpers.pretty(checkerTemplate.generateRulesChecker(this.language, validdef, relativePath),
                "Rules Checker Class", generationStatus);
            fs.writeFileSync(`${this.validatorGenFolder}/${Names.rulesChecker(this.language)}.ts`, checkerFile);

            LOGGER.log(`Generating reserved words file: ${this.validatorGenFolder}/ReservedWords.ts`);
            const reservedWords = reservedWordsTemplate.generateConst();
            Helpers.generateManualFile(`${this.validatorGenFolder}/ReservedWords.ts`, reservedWords,
                "Reserved Words constant definition");
        }

        LOGGER.log(`Generating validator gen index: ${this.validatorGenFolder}/index.ts`);
        const indexFile = Helpers.pretty(validatorTemplate.generateIndex(this.language, validdef),
            "Index Class", generationStatus);
        fs.writeFileSync(`${this.validatorGenFolder}/index.ts`, indexFile);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(this, `Generated validator '${name}' with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(this, `Succesfully generated validator ${name}`);
        }
    }
}
