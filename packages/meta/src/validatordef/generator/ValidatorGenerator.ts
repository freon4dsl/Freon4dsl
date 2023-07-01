import * as fs from "fs";
import { MetaLogger } from "../../utils/MetaLogger";
import { FreMetaLanguage } from "../../languagedef/metalanguage";
import { GenerationStatus, FileUtil, Names, VALIDATOR_FOLDER, VALIDATOR_GEN_FOLDER } from "../../utils";
import { ValidatorDef } from "../metalanguage";
import { RulesCheckerTemplate } from "./templates/RulesCheckerTemplate";
import { ValidatorTemplate } from "./templates/ValidatorTemplate";
import { ReservedWordsTemplate } from "./templates/ReservedWordsTemplate";
import { NonOptionalsCheckerTemplate } from "./templates/NonOptionalsCheckerTemplate";
import { ReferenceCheckerTemplate } from "./templates/ReferenceCheckerTemplate";
import { LOG2USER } from "../../utils/UserLogger";

// TODO use new AstWalker and AstWorker

const LOGGER = new MetaLogger("ValidatorGenerator").mute();
export class ValidatorGenerator {
    public outputfolder: string = ".";
    public language: FreMetaLanguage;
    protected validatorGenFolder: string;
    protected validatorFolder: string;

    generate(validdef: ValidatorDef): void {
        if (this.language === null) {
            LOGGER.error("Cannot generate validator because language is not set.");
            return;
        }
        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        const name = validdef ? validdef.validatorName + " " : "default";
        LOGGER.log("Generating validator: " + name + "in folder " + this.validatorGenFolder);

        const validatorTemplate = new ValidatorTemplate();
        const nonOptionalsCheckerTemplate = new NonOptionalsCheckerTemplate();
        const referenceCheckerTemplate = new ReferenceCheckerTemplate();
        const checkerTemplate = new RulesCheckerTemplate();
        const reservedWordsTemplate = new ReservedWordsTemplate();

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.validatorFolder);
        FileUtil.createDirIfNotExisting(this.validatorGenFolder);
        FileUtil.deleteFilesInDir(this.validatorGenFolder, generationStatus);

        // set relative path to get the imports right
        let relativePath = "../../";

        //  Generate validator
        LOGGER.log(`Generating validator: ${this.validatorGenFolder}/${Names.validator(this.language)}.ts`);
        const validatorFile = FileUtil.pretty(validatorTemplate.generateValidator(this.language, validdef, relativePath),
            "Validator Class", generationStatus);
        fs.writeFileSync(`${this.validatorGenFolder}/${Names.validator(this.language)}.ts`, validatorFile);

        // generate the default checker on non-optional properties
        LOGGER.log(`Generating checker for non-optional parts: ${this.validatorGenFolder}/${Names.nonOptionalsChecker(this.language)}.ts`);
        let checkerFile = FileUtil.pretty(nonOptionalsCheckerTemplate.generateChecker(this.language, relativePath),
            "Non-optionals Checker Class", generationStatus);
        fs.writeFileSync(`${this.validatorGenFolder}/${Names.nonOptionalsChecker(this.language)}.ts`, checkerFile);

        // generate the default checker for references
        LOGGER.log(`Generating checker for references: ${this.validatorGenFolder}/${Names.referenceChecker(this.language)}.ts`);
        checkerFile = FileUtil.pretty(referenceCheckerTemplate.generateChecker(this.language, relativePath),
            "Reference Checker Class", generationStatus);
        fs.writeFileSync(`${this.validatorGenFolder}/${Names.referenceChecker(this.language)}.ts`, checkerFile);

        //  Generate checker
        if (validdef !== null && validdef !== undefined) {
            LOGGER.log(`Generating rules checker: ${this.validatorGenFolder}/${Names.rulesChecker(this.language)}.ts`);
            checkerFile = FileUtil.pretty(checkerTemplate.generateRulesChecker(this.language, validdef, relativePath),
                "Rules Checker Class", generationStatus);
            fs.writeFileSync(`${this.validatorGenFolder}/${Names.rulesChecker(this.language)}.ts`, checkerFile);

            LOGGER.log(`Generating reserved words file: ${this.validatorGenFolder}/ReservedWords.ts`);
            const reservedWords = FileUtil.pretty(reservedWordsTemplate.generateConst(),
                "Rules Checker Class", generationStatus);
            fs.writeFileSync(`${this.validatorGenFolder}/ReservedWords.ts`, reservedWords);
        }

        LOGGER.log(`Generating validator gen index: ${this.validatorGenFolder}/index.ts`);
        const genIndexFile = FileUtil.pretty(validatorTemplate.generateGenIndex(this.language, validdef),
            "Index Class", generationStatus);
        fs.writeFileSync(`${this.validatorGenFolder}/index.ts`, genIndexFile);

        // set relative path to get the imports right
        relativePath = "../";

        LOGGER.log(`Generating validator gen index: ${this.validatorFolder}/${Names.customValidator(this.language)}.ts`);
        const customFile = FileUtil.pretty(validatorTemplate.generateCustomValidator(this.language, relativePath),
            "Custom Validator Class", generationStatus);
        FileUtil.generateManualFile(`${this.validatorFolder}/${Names.customValidator(this.language)}.ts`, customFile, "Custom Validator Class");

        LOGGER.log(`Generating validator gen index: ${this.validatorFolder}/index.ts`);
        const indexFile = FileUtil.pretty(validatorTemplate.generateIndex(this.language),
            "Index Class", generationStatus);
        FileUtil.generateManualFile(`${this.validatorFolder}/index.ts`, indexFile, "Index Class");

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(`Generated validator '${name}' with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Succesfully generated validator ${name}`);
        }
    }

    private getFolderNames() {
        this.validatorFolder = this.outputfolder + "/" + VALIDATOR_FOLDER;
        this.validatorGenFolder = this.outputfolder + "/" + VALIDATOR_GEN_FOLDER;
    }

    clean(force: boolean) {
        this.getFolderNames();
        FileUtil.deleteDirAndContent(this.validatorGenFolder);
        if (force) {
            FileUtil.deleteFile(`${this.validatorFolder}/index.ts`);
            if (this.language === null) {
                LOG2USER.error("Cannot remove all because language is not set.");
            } else {
                FileUtil.deleteFile(`${this.validatorFolder}/${Names.customValidator(this.language)}.ts`);
            }
            FileUtil.deleteDirIfEmpty(this.validatorFolder);
        } else {
            // do not delete the following files, because these may contain user edits
            LOG2USER.info(`${this.validatorFolder}/${Names.customValidator(this.language)}.ts` +
                "\n\t" + `${this.validatorFolder}/index.ts`);
        }
    }
}
