import * as fs from "fs";
import { MetaLogger } from "../../utils/MetaLogger";
import { FreLanguage } from "../../languagedef/metalanguage";
import { TyperDef } from "../metalanguage";
import { GenerationStatus, FileUtil, Names, TYPER_FOLDER, TYPER_GEN_FOLDER, TYPER_CONCEPTS_FOLDER } from "../../utils";
import { FreTyperTemplate } from "./templates/FreTyperTemplate";
import { FreTyperPartTemplate } from "./templates/FreTyperPartTemplate";
import { FreCustomTyperPartTemplate } from "./templates/FreCustomTyperPartTemplate";
import { LOG2USER } from "../../utils/UserLogger";
import { FreTypeConceptMaker } from "./templates/FreTypeConceptMaker";
import { TyperDefTemplate } from "./templates/TyperDefTemplate";

const LOGGER = new MetaLogger("FreonTyperGenerator").mute();

/**
 * This class generates the implementation for a typer definition.
 * It generates a set of files in a number of folders.
 */
export class FreonTyperGenerator {
    public outputfolder: string = ".";
    public language: FreLanguage;
    protected typerGenFolder: string;
    protected typerConceptsFolder: string;
    protected typerFolder: string;

    generate(typerdef: TyperDef): void {
        if (this.language === null) {
            LOGGER.error("Cannot generate typer because language is not set.");
            return;
        }
        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        LOGGER.log("Generating typer in folder " + this.typerGenFolder);

        const typer = new FreTyperTemplate();
        const typerDef = new TyperDefTemplate();
        const typeConceptMaker = new FreTypeConceptMaker();
        const customPart = new FreCustomTyperPartTemplate();
        const typerPart = new FreTyperPartTemplate();

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.typerFolder);
        FileUtil.createDirIfNotExisting(this.typerGenFolder);
        // Note that the creation of the concepts folder must follow the deletion of
        // files in the gen folder, because the concepts folder is part of the gen folder.
        // TODO find more elegant manner
        FileUtil.createDirIfNotExisting(this.typerConceptsFolder);
        FileUtil.deleteFilesInDir(this.typerConceptsFolder, generationStatus);
        // TODO re-introduce deletion of files => take care of correct order of deletion
        FileUtil.deleteFilesInDir(this.typerGenFolder, generationStatus);

        // set relative path to get the imports right
        let relativePath = "../../";

        //  Generate typer
        if (!!typerdef && typerdef.typeConcepts.length > 0 ) {
            typerdef.typeConcepts.forEach(con => {
                LOGGER.log(`Generating type concept: ${this.typerConceptsFolder}/${Names.classifier(con)}.ts`);
                const typeConceptFile = FileUtil.pretty(
                    typeConceptMaker.generateTypeConcept(this.language, con, relativePath + "../"), "Type Concept", generationStatus);
                fs.writeFileSync(`${this.typerConceptsFolder}/${Names.classifier(con)}.ts`, typeConceptFile);
            });

            LOGGER.log(`Generating type concept index: ${this.typerConceptsFolder}/index.ts`);
            const typeConceptIndexFile = FileUtil.pretty(typeConceptMaker.makeIndexFile(typerdef), "Type Concept Index", generationStatus);
            fs.writeFileSync(`${this.typerConceptsFolder}/index.ts`, typeConceptIndexFile);

            LOGGER.log(`Generating type concept index: ${this.typerConceptsFolder}/internal.ts`);
            const typeConceptInternalFile = FileUtil.pretty(typeConceptMaker.makeInternalFile(typerdef), "Type Concept Internal", generationStatus);
            fs.writeFileSync(`${this.typerConceptsFolder}/internal.ts`, typeConceptInternalFile);
        }

        // LOGGER.log(`Generating typer: ${this.typerGenFolder}/${Names.typer(this.language)}.ts`);
        // const typerFile = FileUtil.pretty(typer.generateTyper(this.language, typerdef, relativePath), "Typer Class", generationStatus);
        // fs.writeFileSync(`${this.typerGenFolder}/${Names.typer(this.language)}.ts`, typerFile);

        LOGGER.log(`Generating typerPart: ${this.typerGenFolder}/${Names.typerPart(this.language)}.ts`);
        const checkerFile = FileUtil.pretty(typerPart.generateTyperPart(this.language, typerdef, relativePath), "TyperPart Class", generationStatus);
        fs.writeFileSync(`${this.typerGenFolder}/${Names.typerPart(this.language)}.ts`, checkerFile);

        LOGGER.log(`Generating typer gen index: ${this.typerGenFolder}/index.ts`);
        const typerIndexGenFile = FileUtil.pretty(typer.generateGenIndex(this.language), "Typer Gen Index", generationStatus);
        fs.writeFileSync(`${this.typerGenFolder}/index.ts`, typerIndexGenFile);

        LOGGER.log(`Generating typer init: ${this.typerGenFolder}/${Names.typerDef(this.language)}.ts`);
        const typerDefFile = FileUtil.pretty(typerDef.generateTyperDef(this.language, typerdef, relativePath), "Typer Init", generationStatus);
        fs.writeFileSync(`${this.typerGenFolder}/${Names.typerDef(this.language)}.ts`, typerDefFile);

        // change relative path to get the imports right
        relativePath = "../";

        LOGGER.log(`Generating custom typerPart: ${this.typerFolder}/index.ts`);
        const customTyperFile = FileUtil.pretty(customPart.generateCustomTyperPart(this.language, relativePath), "Custom TyperPart", generationStatus);
        FileUtil.generateManualFile(`${this.typerFolder}/${Names.customTyper(this.language)}.ts`, customTyperFile, "Custom TyperPart");

        LOGGER.log(`Generating typer index: ${this.typerFolder}/index.ts`);
        const typerIndexFile = FileUtil.pretty(typer.generateIndex(this.language), "Typer Index", generationStatus);
        FileUtil.generateManualFile(`${this.typerFolder}/index.ts`, typerIndexFile, "Typer Index");

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(`Generated typer with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Succesfully generated typer`);
        }
    }

    private getFolderNames() {
        this.typerFolder = this.outputfolder + "/" + TYPER_FOLDER;
        this.typerGenFolder = this.outputfolder + "/" + TYPER_GEN_FOLDER;
        this.typerConceptsFolder = this.outputfolder + "/" + TYPER_CONCEPTS_FOLDER;
    }

    clean(force: boolean) {
        // TODO error " FreonCleanAction: ERROR: Stopping typer cleansing because of errors: EPERM: operation not permitted,
        //  unlink 'src\testNoParserAvailable\typer\gen\type-concepts' "
        this.getFolderNames();
        FileUtil.deleteDirAndContent(this.typerConceptsFolder);
        FileUtil.deleteDirAndContent(this.typerGenFolder);
        if (force) {
            FileUtil.deleteFile(`${this.typerFolder}/index.ts`);
            if (this.language === null) {
                LOG2USER.error("Cannot remove all files because language is not set.");
            } else {
                FileUtil.deleteFile(`${this.typerFolder}/${Names.customTyper(this.language)}.ts`);
            }
            FileUtil.deleteDirIfEmpty(this.typerFolder);
        } else {
            // do not delete the following files, because these may contain user edits
            LOG2USER.info(`Not removed: ${this.typerFolder}/${Names.customTyper(this.language)}.ts` +
            "\n\t" + `${this.typerFolder}/index.ts`);
        }
    }
}
