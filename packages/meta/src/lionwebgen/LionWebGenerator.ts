import * as fs from "fs";
import { FreMetaLanguage } from "../languagedef/metalanguage/index.js";
import { MetaLogger } from "../utils/index.js";
import {
    GenerationStatus,
    FileUtil,
    LANGUAGE_FOLDER,
    LANGUAGE_GEN_FOLDER,
    Names,
} from "../utils/index.js";
import {

} from "./templates/index.js";
import { LionWebTemplate } from "./templates/LionWebTemplate.js";

const LOGGER = new MetaLogger("LionWebGenerator").mute();
export class LionWebGenerator {
    // @ts-ignore
    public language: FreMetaLanguage
    public outputfolder: string = ".";
    private languageFolder: string = "";
    private lionWebFolder: string = "lionweb";

    generate(): void {
        LOGGER.log(
            "Generating LionWeb language '" + this.language.name + "' in folder " + this.outputfolder + "/" + LANGUAGE_GEN_FOLDER,
        );
        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        
        // Prepare folders
        FileUtil.createDirIfNotExisting(this.lionWebFolder);
        FileUtil.deleteFilesInDir(this.lionWebFolder, generationStatus);

        //  Generate it
        const lionWebTemplate = new LionWebTemplate()
        LOGGER.log(`Generating model: ${this.lionWebFolder}/${Names.classifier(this.language.modelConcept)}.json`);
        const generated = lionWebTemplate.generate(this.language)
        fs.writeFileSync(`${this.lionWebFolder}/${Names.classifier(this.language.modelConcept)}.json`, generated);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.info(`Generated language '${this.language.name}' with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Succesfully generated language '${this.language.name}'`);
        }
    }

    private getFolderNames() {
        this.lionWebFolder = this.outputfolder + "/" + "lionweb";
        this.languageFolder = this.outputfolder + "/" + LANGUAGE_FOLDER;
    }

    clean() {
        this.getFolderNames();
        FileUtil.deleteDirAndContent(this.lionWebFolder);
        FileUtil.deleteDirIfEmpty(this.languageFolder);
    }
}
