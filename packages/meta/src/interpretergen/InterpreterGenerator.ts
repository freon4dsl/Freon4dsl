import * as fs from "fs";
import { PiLanguage } from "../languagedef/metalanguage";
import {
    GenerationStatus,
    FileUtil,
    MetaLogger,
    INTERPRETER_FOLDER, INTERPRETER_GEN_FOLDER
} from "../utils";
import { InterpreterBaseTemplate } from "./templates/InterpreterBaseTemplate";

const LOGGER = new MetaLogger("InterpreterGenerator").mute();

/**
 */
export class InterpreterGenerator {
    public outputfolder: string = ".";
    public language: PiLanguage;
    private interpreterFolder: string;
    private interpreterGenFolder: string;
    fileNames: string[] = [];

    generate(): void {
        if (this.language == null) {
            LOGGER.error("Cannot generate interpreter because language is not set.");
            return;
        }
        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        LOGGER.log("Generating interpreter in folder " + this.interpreterFolder + " for language " + this.language?.name);

        const htmlTemplate = new InterpreterBaseTemplate(true);

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.interpreterGenFolder);
        FileUtil.deleteFilesInDir(this.interpreterGenFolder, generationStatus);

        // TODO Change this for interpreter
        let generatedFilePath = `${this.interpreterGenFolder}/complete-view.html`;
        let generatedContent  = htmlTemplate.interpreterBase(this.language);
        this.makeFile(`complete diagram in html`, generatedFilePath, generatedContent, generationStatus);

    }

    private makeFile(generationMessage: string, generatedFilePath: string, generatedContent: string, generationStatus: GenerationStatus) {
        LOGGER.log(`Generating ${generationMessage}: ${generatedFilePath}`);
        fs.writeFileSync(`${generatedFilePath}`, generatedContent);
    }

    private getFolderNames() {
        this.interpreterFolder = this.outputfolder + "/" + INTERPRETER_FOLDER;
        this.interpreterGenFolder = this.outputfolder + "/" + INTERPRETER_GEN_FOLDER;
    }

    clean(force: boolean) {
        this.getFolderNames();
        FileUtil.deleteDirAndContent(this.interpreterGenFolder);
        FileUtil.deleteDirIfEmpty(this.interpreterFolder);
    }
}
