import * as fs from "fs";
import { MetaLogger } from "../../utils/no-dependencies/index.js";
import { FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import { Names, VALIDATOR_FOLDER } from "../../utils/on-lang/index.js";
import { FileUtil, GenerationStatus } from '../../utils/file-utils/index.js';
import { ValidatorDef } from "../metalanguage/index.js";
import { RulesCheckerTemplate } from "./templates/RulesCheckerTemplate.js";
import { ValidatorTemplate } from "./templates/ValidatorTemplate.js";
import { ReservedWordsTemplate } from "./templates/ReservedWordsTemplate.js";
import { NonOptionalsCheckerTemplate } from "./templates/NonOptionalsCheckerTemplate.js";
import { ReferenceCheckerTemplate } from "./templates/ReferenceCheckerTemplate.js";
import { NamespaceCheckerTemplate } from './templates/NamespaceCheckerTemplate.js';
import { getCombinedFolderPath } from '../../utils/no-dependencies/FolderPathHelper.js';

// TODO use new AstWalker and AstWorker

const LOGGER = new MetaLogger("ValidatorGenerator").mute();
export class ValidatorGenerator {
    public outputFolder: string = ".";
    public customsFolder: string = ".";
    public language: FreMetaLanguage | undefined;
    protected validatorFolder: string = "";

    generate(validdef: ValidatorDef | undefined): void {
        if (this.language === null || this.language === undefined) {
            LOGGER.error("Cannot generate validator because language is not set.");
            return;
        }
        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        LOGGER.log("Generating validator in folder " + this.validatorFolder);

        const validatorTemplate = new ValidatorTemplate();
        const nonOptionalsCheckerTemplate = new NonOptionalsCheckerTemplate();
        const namespaceCheckerTemplate = new NamespaceCheckerTemplate();
        const referenceCheckerTemplate = new ReferenceCheckerTemplate();
        const checkerTemplate = new RulesCheckerTemplate();
        const reservedWordsTemplate = new ReservedWordsTemplate();

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.outputFolder + "/" + this.customsFolder); // will not be overwritten
        FileUtil.createDirIfNotExisting(this.validatorFolder);
        FileUtil.deleteFilesInDir(this.validatorFolder, generationStatus);

        // set relative path to get the imports right
        let relativePath = "..";

        //  Generate validator
        LOGGER.log(`Generating validator: ${this.validatorFolder}/${Names.validator(this.language)}.ts`);
        const validatorFile = FileUtil.pretty(
            validatorTemplate.generateValidator(this.language, validdef, this.customsFolder, relativePath),
            "Validator Class",
            generationStatus,
        );
        fs.writeFileSync(`${this.validatorFolder}/${Names.validator(this.language)}.ts`, validatorFile);

        // generate the default checker on non-optional properties
        LOGGER.log(
            `Generating checker for non-optional parts: ${this.validatorFolder}/${Names.nonOptionalsChecker(this.language)}.ts`,
        );
        let checkerFile = FileUtil.pretty(
            nonOptionalsCheckerTemplate.generateChecker(this.language, relativePath),
            "Non-optionals Checker Class",
            generationStatus,
        );
        fs.writeFileSync(`${this.validatorFolder}/${Names.nonOptionalsChecker(this.language)}.ts`, checkerFile);

        // generate the default checker for references
        LOGGER.log(
            `Generating checker for references: ${this.validatorFolder}/${Names.referenceChecker(this.language)}.ts`,
        );
        checkerFile = FileUtil.pretty(
            referenceCheckerTemplate.generateChecker(this.language, relativePath),
            "Reference Checker Class",
            generationStatus,
        );
        fs.writeFileSync(`${this.validatorFolder}/${Names.referenceChecker(this.language)}.ts`, checkerFile);

        // generate the default checker on namespaces
        LOGGER.log(
          `Generating checker for namespaces: ${this.validatorFolder}/${Names.namespaceChecker(this.language)}.ts`,
        );
        checkerFile = FileUtil.pretty(
          namespaceCheckerTemplate.generateChecker(this.language, relativePath),
          "Namespace Checker Class",
          generationStatus,
        );
        fs.writeFileSync(`${this.validatorFolder}/${Names.namespaceChecker(this.language)}.ts`, checkerFile);

        //  Generate checker
        if (validdef !== null && validdef !== undefined) {
            LOGGER.log(`Generating rules checker: ${this.validatorFolder}/${Names.rulesChecker(this.language)}.ts`);
            checkerFile = FileUtil.pretty(
                checkerTemplate.generateRulesChecker(this.language, validdef, relativePath),
                "Rules Checker Class",
                generationStatus,
            );
            fs.writeFileSync(`${this.validatorFolder}/${Names.rulesChecker(this.language)}.ts`, checkerFile);

            LOGGER.log(`Generating reserved words file: ${this.validatorFolder}/ReservedWords.ts`);
            const reservedWords = FileUtil.pretty(
                reservedWordsTemplate.generateConst(),
                "Rules Checker Class",
                generationStatus,
            );
            fs.writeFileSync(`${this.validatorFolder}/ReservedWords.ts`, reservedWords);
        }

        LOGGER.log(`Generating validator gen index: ${this.validatorFolder}/index.ts`);
        const genIndexFile = FileUtil.pretty(
            validatorTemplate.generateGenIndex(this.language, validdef),
            "Index Class",
            generationStatus,
        );
        fs.writeFileSync(`${this.validatorFolder}/index.ts`, genIndexFile);

        // set relative path to get the imports right
        relativePath = getCombinedFolderPath(this.outputFolder, this.customsFolder);

        LOGGER.log(
            `Generating custom validator: ${this.outputFolder}/${this.customsFolder}/${Names.customValidator(this.language)}.ts`,
        );
        const customFile = FileUtil.pretty(
            validatorTemplate.generateCustomValidator(this.language, relativePath),
            "Custom Validator Class",
            generationStatus,
        );
        FileUtil.generateManualFile(
            `${this.outputFolder}/${this.customsFolder}/${Names.customValidator(this.language)}.ts`,
            customFile,
            "Custom Validator Class",
        );

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(`Generated validator with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Successfully generated validator`);
        }
    }

    private getFolderNames() {
        this.validatorFolder = this.outputFolder + "/" + VALIDATOR_FOLDER;
    }
}
