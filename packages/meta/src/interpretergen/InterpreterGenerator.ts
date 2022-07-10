import * as fs from "fs";
import { PiLanguage } from "../languagedef/metalanguage";
import { GenerationStatus, FileUtil, DIAGRAM_FOLDER, MetaLogger, DIAGRAM_GEN_FOLDER } from "../utils";
import { InterpreterBaseTemplate } from "./templates/InterpreterBaseTemplate";

const LOGGER = new MetaLogger("InterpreterGenerator").mute();

/**
 */
export class InterpreterGenerator {
    public outputfolder: string = ".";
    public language: PiLanguage;
    private diagramFolder: string;
    private diagramGenFolder: string;
    fileNames: string[] = [];
    private diagramAstFolder: string;

    generate(): void {
        if (this.language == null) {
            LOGGER.error("Cannot generate diagrams because language is not set.");
            return;
        }
        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        LOGGER.log("Generating diagrams in folder " + this.diagramFolder + " for language " + this.language?.name);

        const htmlTemplate = new InterpreterBaseTemplate(true);

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.diagramGenFolder);
        FileUtil.deleteFilesInDir(this.diagramGenFolder, generationStatus);

        // make title
        let title: string = `Class diagram for language ${this.language.name}`;

        //  Generate the html version of the complete diagram
        let generatedFilePath = `${this.diagramGenFolder}/complete-view.html`;
        let generatedContent  = htmlTemplate.interpreterBase(this.language);
        this.makeFile(`complete diagram in html`, generatedFilePath, generatedContent, generationStatus);

    }

    private makeFile(generationMessage: string, generatedFilePath: string, generatedContent: string, generationStatus: GenerationStatus) {
        LOGGER.log(`Generating ${generationMessage}: ${generatedFilePath}`);
        fs.writeFileSync(`${generatedFilePath}`, generatedContent);
    }

    private getFolderNames() {
        this.diagramFolder = this.outputfolder + "/" + DIAGRAM_FOLDER;
        this.diagramGenFolder = this.outputfolder + "/" + DIAGRAM_GEN_FOLDER;
        this.diagramAstFolder = this.outputfolder + "/" + DIAGRAM_GEN_FOLDER + "/ast";
    }

    clean(force: boolean) {
        this.getFolderNames();
        FileUtil.deleteDirAndContent(this.diagramAstFolder);
        FileUtil.deleteDirIfEmpty(this.diagramAstFolder);
        FileUtil.deleteDirAndContent(this.diagramGenFolder);
        FileUtil.deleteDirIfEmpty(this.diagramGenFolder);
        FileUtil.deleteDirAndContent(this.diagramFolder);
        FileUtil.deleteDirIfEmpty(this.diagramFolder);
    }
}
