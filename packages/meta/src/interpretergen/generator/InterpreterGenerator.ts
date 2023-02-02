import * as fs from "fs";
import { FreLanguage } from "../../languagedef/metalanguage";
import {
    GenerationStatus,
    FileUtil,
    MetaLogger,
    INTERPRETER_FOLDER, INTERPRETER_GEN_FOLDER, Names
} from "../../utils";
import { FreInterpreterDef } from "../metalanguage/FreInterpreterDef";
import { InterpreterBaseTemplate } from "./templates/InterpreterBaseTemplate";
import { InterpreterMainTemplate } from "./templates/InterpreterMainTemplate";

const LOGGER = new MetaLogger("InterpreterGenerator").mute();

/**
 */
export class InterpreterGenerator {
    public outputfolder: string = ".";
    public language: FreLanguage;
    private interpreterFolder: string;
    private interpreterGenFolder: string;
    fileNames: string[] = [];

    generate(interpreterDef: FreInterpreterDef): void {
        if (this.language == null) {
            LOGGER.error("Cannot generate interpreter because language is not set.");
            return;
        }
        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        LOGGER.log("Generating interpreter in folder " + this.interpreterFolder + " for language " + this.language?.name);

        const template = new InterpreterBaseTemplate();
        const mainTemplate = new InterpreterMainTemplate();

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.interpreterGenFolder);
        FileUtil.deleteFilesInDir(this.interpreterGenFolder, generationStatus);

        let generatedFilePath = `${this.interpreterGenFolder}/${Names.interpreterBaseClassname(this.language)}.ts`;
        let generatedContent  = template.interpreterBase(this.language, interpreterDef);
        this.makeFile("interpreter base", generatedFilePath, generatedContent, generationStatus);

        generatedFilePath = `${this.interpreterFolder}/${Names.interpreterClassname(this.language)}.ts`;
        generatedContent  = template.interpreterClass(this.language, interpreterDef);
        FileUtil.generateManualFile(generatedFilePath, generatedContent, "interpreter class");
        // this.makeFile("interpreter class", generatedFilePath, generatedContent, generationStatus);

        generatedFilePath = `${this.interpreterGenFolder}/${Names.interpreterInitname(this.language)}.ts`;
        generatedContent  = template.interpreterInit(this.language, interpreterDef);
        this.makeFile("interpreter init", generatedFilePath, generatedContent, generationStatus);
        // FileUtil.generateManualFile(generatedFilePath, generatedContent, "interpreter init")

        generatedFilePath = `${this.interpreterFolder}/${Names.interpreterName(this.language)}.ts`;
        generatedContent  = mainTemplate.interpreterMain(this.language, interpreterDef);
        this.makeFile("interpreter main", generatedFilePath, generatedContent, generationStatus);
    }

    private makeFile(generationMessage: string, generatedFilePath: string, generatedContent: string, generationStatus: GenerationStatus) {
        LOGGER.log(`Generating: ${generatedFilePath}`);
        const generated = FileUtil.pretty(generatedContent, "interpreter " , generationStatus);
        fs.writeFileSync(generatedFilePath, generated);
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
