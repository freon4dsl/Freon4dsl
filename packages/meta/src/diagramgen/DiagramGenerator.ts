import * as fs from "fs";
import { DIAGRAM_FOLDER, MetaLogger } from "../utils";
import { PiLanguage } from "../languagedef/metalanguage";
import { GenerationStatus, FileUtil, Names, READER_FOLDER, READER_GEN_FOLDER, WRITER_FOLDER, WRITER_GEN_FOLDER } from "../utils";
import { CompleteTemplate } from "./diagramTemplates/CompleteTemplate";

const LOGGER = new MetaLogger("DiagramGenerator").mute();

/**
 */
export class DiagramGenerator {
    public outputfolder: string = ".";
    public language: PiLanguage;
    private diagramFolder: string;

    generate(): void {
        if (this.language == null) {
            LOGGER.error("Cannot generate diagrams because language is not set.");
            return;
        }
        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        LOGGER.log("Generating diagrams in folder " + this.diagramFolder + " for language " + this.language?.name);

        const allTemplate = new CompleteTemplate();

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.diagramFolder);
        FileUtil.deleteFilesInDir(this.diagramFolder, generationStatus);

        //  Generate the writer
        let generatedFilePath = `${this.diagramFolder}/complete-view.html`;
        let generatedContent  = allTemplate.generate(this.language, this.diagramFolder);
        this.makeFile(`complete diagram`, generatedFilePath, generatedContent, generationStatus);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(`Generated diagrams for ${this.language.name} with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Succesfully generated diagrams.`);
        }
    }

    private makeFile(generationMessage: string, generatedFilePath: string, generatedContent: string, generationStatus: GenerationStatus) {
        LOGGER.log(`Generating ${generationMessage}: ${generatedFilePath}`);
        generatedContent = FileUtil.pretty(generatedContent, `${generatedFilePath}`, generationStatus);
        fs.writeFileSync(`${generatedFilePath}`, generatedContent);
    }

    private getFolderNames() {
        this.diagramFolder = this.outputfolder + "/" + DIAGRAM_FOLDER;
    }

    clean(force: boolean) {
        this.getFolderNames();
        FileUtil.deleteDirAndContent(this.diagramFolder);
        FileUtil.deleteDirIfEmpty(this.diagramFolder);
    }
}
