import * as fs from "fs";
import { FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import { INTERPRETER_FOLDER, INTERPRETER_GEN_FOLDER, Names } from "../../utils/on-lang/index.js";
import { GenerationStatus, FileUtil } from "../../utils/file-utils/index.js";
import { MetaLogger } from "../../utils/no-dependencies/index.js";
import { FreInterpreterDef } from "../metalanguage/FreInterpreterDef.js";
import { InterpreterBaseTemplate } from "./templates/InterpreterBaseTemplate.js";
import { InterpreterMainTemplate } from "./templates/InterpreterMainTemplate.js";
import { getOutputForUseInCustom } from '../../utils/no-dependencies/FolderPathHelper.js';

const LOGGER = new MetaLogger("InterpreterGenerator").mute();

/**
 */
export class InterpreterGenerator {
    public outputfolder: string = ".";
    public customsfolder: string = ".";
    public language: FreMetaLanguage | undefined;
    private interpreterFolder: string = "";
    private interpreterGenFolder: string = "";
    fileNames: string[] = [];

    generate(interpreterDef: FreInterpreterDef): void {
        if (this.language === null || this.language === undefined) {
            LOGGER.error("Cannot generate interpreter because language is not set.");
            return;
        }
        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        LOGGER.log(
            "Generating interpreter in folder " + this.interpreterFolder + " for language " + this.language?.name,
        );

        const template = new InterpreterBaseTemplate();
        const mainTemplate = new InterpreterMainTemplate();

        // Set relative path to get the imports right
        let relativePath = "../../";

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.outputfolder + this.customsfolder); // will not be overwritten
        FileUtil.createDirIfNotExisting(this.interpreterGenFolder);
        FileUtil.deleteFilesInDir(this.interpreterGenFolder, generationStatus);

        let generatedFilePath = `${this.interpreterGenFolder}/${Names.interpreterBaseClassname(this.language)}.ts`;
        let generatedContent = template.interpreterBase(this.language, interpreterDef, relativePath);
        this.makeFile(generatedFilePath, generatedContent, generationStatus);

        generatedFilePath = `${this.interpreterGenFolder}/${Names.interpreterInitname(this.language)}.ts`;
        generatedContent = template.interpreterInit(this.language, interpreterDef, this.customsfolder, relativePath);
        this.makeFile(generatedFilePath, generatedContent, generationStatus);

        // Change relative path to get the imports right
        relativePath = getOutputForUseInCustom(this.outputfolder, this.customsfolder);

        generatedFilePath = `${this.outputfolder}${this.customsfolder}/${Names.interpreterName(this.language)}.ts`;
        generatedContent = mainTemplate.interpreterMain(this.language, relativePath);
        this.makeFile(generatedFilePath, generatedContent, generationStatus);

        generatedFilePath = `${this.outputfolder}${this.customsfolder}/${Names.interpreterClassname(this.language)}.ts`;
        generatedContent = FileUtil.pretty(template.interpreterClass(this.language, relativePath), "interpreter manual file" ,generationStatus);
        FileUtil.generateManualFile(generatedFilePath, generatedContent, "interpreter class");
    }

    private makeFile(generatedFilePath: string, generatedContent: string, generationStatus: GenerationStatus) {
        LOGGER.log(`Generating: ${generatedFilePath}`);
        const generated = FileUtil.pretty(generatedContent, "interpreter ", generationStatus);
        fs.writeFileSync(generatedFilePath, generated);
    }

    private getFolderNames() {
        this.interpreterFolder = this.outputfolder + "/" + INTERPRETER_FOLDER;
        this.interpreterGenFolder = this.outputfolder + "/" + INTERPRETER_GEN_FOLDER;
    }

    clean(force: boolean) {
        this.getFolderNames();
        FileUtil.deleteDirAndContent(this.interpreterGenFolder);
        if (force) {
            FileUtil.deleteDirAndContent(this.interpreterFolder);
        } else {
            FileUtil.deleteDirIfEmpty(this.interpreterFolder);
        }
    }
}
