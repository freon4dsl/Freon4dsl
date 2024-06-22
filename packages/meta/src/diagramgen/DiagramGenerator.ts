import * as fs from "fs";
import { FreMetaLanguage } from "../languagedef/metalanguage";
import { GenerationStatus, FileUtil, DIAGRAM_FOLDER, MetaLogger, DIAGRAM_GEN_FOLDER } from "../utils";
import { HtmlTemplate } from "./diagramTemplates/HtmlTemplate";
import { MarkDownTemplate } from "./diagramTemplates/MarkDownTemplate";
import { DiagramTemplate } from "./diagramTemplates/DiagramTemplate";

const LOGGER = new MetaLogger("DiagramGenerator").mute();

/**
 */
export class DiagramGenerator {
    public outputfolder: string = ".";
    public language: FreMetaLanguage;
    private diagramFolder: string = '';
    private diagramGenFolder: string = '';
    fileNames: string[] = [];
    private diagramAstFolder: string = '';

    generate(): void {
        if (this.language === null) {
            LOGGER.error("Cannot generate diagrams because language is not set.");
            return;
        }
        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        LOGGER.log("Generating diagrams in folder " + this.diagramFolder + " for language " + this.language?.name);

        const htmlTemplate = new HtmlTemplate();
        const mdTemplate = new MarkDownTemplate();
        const htmlMaker = new DiagramTemplate(true);
        const mdMaker = new DiagramTemplate(false);

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.diagramGenFolder);
        FileUtil.deleteFilesInDir(this.diagramGenFolder, generationStatus);
        FileUtil.createDirIfNotExisting(this.diagramFolder);
        FileUtil.deleteFilesInDir(this.diagramFolder, generationStatus);
        FileUtil.createDirIfNotExisting(this.diagramAstFolder);
        FileUtil.deleteFilesInDir(this.diagramAstFolder, generationStatus);

        // make title
        let title: string = `Class diagram for language ${this.language.name}`;

        //  Generate the html version of the complete diagram
        let generatedFilePath = `${this.diagramGenFolder}/complete-view.html`;
        let content: string = htmlMaker.makeOverview(this.language);
        let generatedContent = htmlTemplate.generate(title, content);
        this.makeFile(`complete diagram in html`, generatedFilePath, generatedContent);

        //  Generate the md version of the complete diagram
        generatedFilePath = `${this.diagramGenFolder}/complete-view.md`;
        content = mdMaker.makeOverview(this.language);
        generatedContent = mdTemplate.generate(title, content);
        this.makeFile(`complete diagram in md`, generatedFilePath, generatedContent);

        title = `Inheritance diagram for language ${this.language.name}`;

        //  Generate the html version of the inheritance diagram
        generatedFilePath = `${this.diagramGenFolder}/inheritance-view.html`;
        content = htmlMaker.makeInheritanceTrees(this.language);
        generatedContent = htmlTemplate.generate(title, content);
        this.makeFile(`inheritance diagram in html`, generatedFilePath, generatedContent);

        //  Generate the md version of the inheritance diagram
        generatedFilePath = `${this.diagramGenFolder}/inheritance-view.md`;
        content = mdMaker.makeInheritanceTrees(this.language);
        generatedContent = mdTemplate.generate(title, content);
        this.makeFile(`inheritance diagram in md`, generatedFilePath, generatedContent);

        // Generate diagrams for all .ast files
        for (const name of this.fileNames) {
            let tmpName: string | undefined = name.split(FileUtil.separator()).pop();
            if ( !!tmpName && tmpName.length > 0) {
                tmpName = tmpName.split(".").shift();
            }
            if ( !!tmpName && tmpName.length > 0) {
                const fName: string = tmpName as string;
                title = `Class diagram for file ${fName}`;
                //  Generate the html version of the inheritance diagram
                generatedFilePath = `${this.diagramAstFolder}/${fName}-view.html`;
                content = htmlMaker.makeOverviewPerFile(this.language, name);
                generatedContent = htmlTemplate.generate(title, content);
                this.makeFile(`${fName} diagram in html`, generatedFilePath, generatedContent);

                //  Generate the md version of the inheritance diagram
                generatedFilePath = `${this.diagramAstFolder}/${fName}-view.md`;
                content = mdMaker.makeOverviewPerFile(this.language, name);
                generatedContent = mdTemplate.generate(title, content);
                this.makeFile(`${fName} diagram in md`, generatedFilePath, generatedContent);
            }
        }

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(`Generated diagrams for ${this.language.name} with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Succesfully generated diagrams.`);
        }
    }

    private makeFile(generationMessage: string, generatedFilePath: string, generatedContent: string) {
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
        // Note that the order in which the folders are removed is significant
        FileUtil.deleteDirAndContent(this.diagramAstFolder);
        if (force) {
            FileUtil.deleteDirAndContent(this.diagramAstFolder);
        } else {
            FileUtil.deleteDirIfEmpty(this.diagramAstFolder);
        }
        FileUtil.deleteDirAndContent(this.diagramGenFolder);
        if (force) {
            FileUtil.deleteDirAndContent(this.diagramGenFolder);
        } else {
            FileUtil.deleteDirIfEmpty(this.diagramGenFolder);
        }
        FileUtil.deleteDirAndContent(this.diagramFolder);
        if (force) {
            FileUtil.deleteDirAndContent(this.diagramFolder);
        } else {
            FileUtil.deleteDirIfEmpty(this.diagramFolder);
        }
    }
}
