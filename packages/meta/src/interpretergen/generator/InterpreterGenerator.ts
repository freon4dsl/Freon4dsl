import * as fs from "fs";
import type { FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import { INTERPRETER_FOLDER, Names } from "../../utils/on-lang/index.js";
import { GenerationStatus, FileUtil } from "../../utils/file-utils/index.js";
import { MetaLogger } from "../../utils/no-dependencies/index.js";
import type { FreInterpreterDef } from "../metalanguage/FreInterpreterDef.js";
import { InterpreterBaseTemplate } from "./templates/InterpreterBaseTemplate.js";
import { InterpreterMainTemplate } from "./templates/InterpreterMainTemplate.js";
import { getCombinedFolderPath } from '../../utils/no-dependencies/FolderPathHelper.js';

const LOGGER = new MetaLogger("InterpreterGenerator").mute();

/**
 */
export class InterpreterGenerator {
    public outputFolder: string = ".";
    public customsFolder: string = ".";
    public language: FreMetaLanguage | undefined;
    private interpreterFolder: string = "";
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
        let relativePath = "..";

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.outputFolder + "/" + this.customsFolder); // will not be overwritten
        FileUtil.createDirIfNotExisting(this.interpreterFolder);
        FileUtil.deleteFilesInDir(this.interpreterFolder, generationStatus);

        let generatedFilePath = `${this.interpreterFolder}/${Names.interpreterBaseClassname(this.language)}.ts`;
        let generatedContent = template.interpreterBase(this.language, interpreterDef, relativePath);
        this.makeFile(generatedFilePath, generatedContent, generationStatus);

        generatedFilePath = `${this.interpreterFolder}/${Names.interpreterInitname(this.language)}.ts`;
        generatedContent = template.interpreterInit(this.language, interpreterDef, this.customsFolder, relativePath);
        this.makeFile(generatedFilePath, generatedContent, generationStatus);

        // Change relative path to get the imports right
        relativePath = getCombinedFolderPath(this.outputFolder, this.customsFolder);

        generatedFilePath = `${this.outputFolder}/${this.customsFolder}/${Names.interpreterName(this.language)}.ts`;
        generatedContent = mainTemplate.interpreterMain(this.language, relativePath);
        this.makeFile(generatedFilePath, generatedContent, generationStatus);

        generatedFilePath = `${this.outputFolder}/${this.customsFolder}/${Names.interpreterClassname(this.language)}.ts`;
        generatedContent = FileUtil.pretty(template.interpreterClass(this.language, relativePath), "interpreter manual file" ,generationStatus);
        FileUtil.generateManualFile(generatedFilePath, generatedContent, "interpreter class");
    }

    private makeFile(generatedFilePath: string, generatedContent: string, generationStatus: GenerationStatus) {
        LOGGER.log(`Generating: ${generatedFilePath}`);
        const generated = FileUtil.pretty(generatedContent, "interpreter ", generationStatus);
        fs.writeFileSync(generatedFilePath, generated);
    }

    private getFolderNames() {
        this.interpreterFolder = this.outputFolder + "/" + INTERPRETER_FOLDER;
    }
}
