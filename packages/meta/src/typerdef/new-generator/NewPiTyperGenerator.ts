import * as fs from "fs";
import { MetaLogger } from "../../utils/MetaLogger";
import { PiLanguage } from "../../languagedef/metalanguage";
import { PiTyperDef } from "../new-metalanguage";
import { GenerationStatus, Helpers, Names, TYPER_FOLDER, TYPER_GEN_FOLDER } from "../../utils";
import { PiTyperTemplate } from "./templates/PiTyperTemplate";
import { PiTyperPartTemplate } from "./templates/PiTyperPartTemplate";
import { CustomTyperPartTemplate } from "./templates/CustomTyperPartTemplate";
import { LOG2USER } from "../../utils/UserLogger";

const LOGGER = new MetaLogger("PiTyperGenerator").mute();
export class NewPiTyperGenerator {
    public outputfolder: string = ".";
    public language: PiLanguage;
    protected typerGenFolder: string;
    protected typerFolder: string;

    generate(typerdef: PiTyperDef): void {
        if (this.language == null) {
            LOGGER.error("Cannot generate typer because language is not set.");
            return;
        }
        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        const name = typerdef ? typerdef.name + " " : "";
        LOGGER.log("Generating typer: " + name + "in folder " + this.typerGenFolder);

        const typer = new PiTyperTemplate();
        const customPart = new CustomTyperPartTemplate();
        const typerPart = new PiTyperPartTemplate();

        // Prepare folders
        Helpers.createDirIfNotExisting(this.typerFolder);
        Helpers.createDirIfNotExisting(this.typerGenFolder);
        Helpers.deleteFilesInDir(this.typerGenFolder, generationStatus);

        // set relative path to get the imports right
        let relativePath = "../../";

        //  Generate typer
        LOGGER.log(`Generating typer: ${this.typerGenFolder}/${Names.typer(this.language)}.ts`);
        const typerFile = Helpers.pretty(typer.generateTyper(this.language, typerdef, relativePath), "Typer Class", generationStatus);
        fs.writeFileSync(`${this.typerGenFolder}/${Names.typer(this.language)}.ts`, typerFile);

        LOGGER.log(`Generating typerPart: ${this.typerGenFolder}/${Names.typerPart(this.language)}.ts`);
        const checkerFile = Helpers.pretty(typerPart.generateTyperPart(this.language, typerdef, relativePath), "TyperPart Class", generationStatus);
        fs.writeFileSync(`${this.typerGenFolder}/${Names.typerPart(this.language)}.ts`, checkerFile);

        LOGGER.log(`Generating typer gen index: ${this.typerGenFolder}/index.ts`);
        const typerIndexGenFile = Helpers.pretty(typer.generateGenIndex(this.language), "Typer Gen Index", generationStatus);
        fs.writeFileSync(`${this.typerGenFolder}/index.ts`, typerIndexGenFile);

        // change relative path to get the imports right
        relativePath = "../";

        LOGGER.log(`Generating custom typerPart: ${this.typerFolder}/index.ts`);
        // TODO this default should return false in all cases
        const customTyperFile = Helpers.pretty(customPart.generateCustomTyperPart(this.language, relativePath), "Custom TyperPart", generationStatus);
        Helpers.generateManualFile(`${this.typerFolder}/${Names.customTyper(this.language)}.ts`, customTyperFile, "Custom TyperPart");

        LOGGER.log(`Generating typer index: ${this.typerFolder}/index.ts`);
        const typerIndexFile = Helpers.pretty(typer.generateIndex(this.language), "Typer Index", generationStatus);
        Helpers.generateManualFile(`${this.typerFolder}/index.ts`, typerIndexFile, "Typer Index");

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(`Generated typer '${name}' with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Succesfully generated typer ${name}`);
        }
    }

    private getFolderNames() {
        this.typerFolder = this.outputfolder + "/" + TYPER_FOLDER;
        this.typerGenFolder = this.outputfolder + "/" + TYPER_GEN_FOLDER;
    }

    clean(force: boolean) {
        this.getFolderNames();
        Helpers.deleteDirAndContent(this.typerGenFolder);
        if (force) {
            Helpers.deleteFile(`${this.typerFolder}/index.ts`);
            if (this.language == null) {
                LOG2USER.error("Cannot remove all files because language is not set.");
            } else {
                Helpers.deleteFile(`${this.typerFolder}/${Names.customTyper(this.language)}.ts`);
            }
            Helpers.deleteDirIfEmpty(this.typerFolder);
        } else {
            // do not delete the following files, because these may contain user edits
            LOG2USER.info(`Not removed: ${this.typerFolder}/${Names.customTyper(this.language)}.ts` +
            '\n\t' + `${this.typerFolder}/index.ts`);
        }
    }
}
