import * as fs from "fs";
import { MetaLogger } from "../../utils/index.js";
import { FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import {
    GenerationStatus,
    FileUtil,
    isNullOrUndefined,
    Names,
    SCOPER_FOLDER,
    SCOPER_GEN_FOLDER,
} from "../../utils/index.js";
import { ScopeDef } from "../metalanguage/index.js";
import { CustomScoperTemplate } from "./templates/CustomScoperTemplate.js";
import { ScoperDefTemplate } from "./templates/ScoperDefTemplate.js";
import { ScoperTemplate } from "./templates/ScoperTemplate.js";
import { MetaElementReference, FreMetaModelDescription } from "../../languagedef/metalanguage/index.js";

const LOGGER: MetaLogger = new MetaLogger("ScoperGenerator").mute();
export class ScoperGenerator {
    public outputfolder: string = ".";
    public language: FreMetaLanguage | undefined;
    protected scoperGenFolder: string = "";
    protected scoperFolder: string = "";

    generate(scopedef: ScopeDef | undefined): void {
        if (this.language === null || this.language === undefined) {
            LOGGER.error("Cannot generate scoper because language is not set.");
            return;
        }
        // generate default, if the scoper definition is not present, i.e. was not read from file
        if (isNullOrUndefined(scopedef)) {
            scopedef = new ScopeDef();
            scopedef.languageName = this.language.name;
            scopedef.namespaces = [];
            scopedef.namespaces.push(
                MetaElementReference.create<FreMetaModelDescription>(this.language.modelConcept, "FreModelDescription"),
            );
        }

        const generationStatus: GenerationStatus = new GenerationStatus();
        this.getFolderNames();
        LOGGER.log("Generating scoper in folder " + this.scoperGenFolder);

        const scoper: ScoperTemplate = new ScoperTemplate();
        const scoperDefTemplate: ScoperDefTemplate = new ScoperDefTemplate();
        const customScoperTemplate: CustomScoperTemplate = new CustomScoperTemplate();

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.scoperFolder);
        FileUtil.createDirIfNotExisting(this.scoperGenFolder);
        FileUtil.deleteFilesInDir(this.scoperGenFolder, generationStatus);

        // set relative path to get the imports right
        const relativePath = "../../";

        //  Generate it
        LOGGER.log(`Generating scoper: ${this.scoperGenFolder}/${Names.scoper(this.language)}.ts`);
        const scoperFile = FileUtil.pretty(
            scoper.generateScoper(this.language, scopedef, relativePath),
            "Scoper Class",
            generationStatus,
        );
        fs.writeFileSync(`${this.scoperGenFolder}/${Names.scoper(this.language)}.ts`, scoperFile);

        LOGGER.log(
            `Generating scope language definition: ${this.scoperGenFolder}/${Names.scoperDef(this.language)}.ts`,
        );
        const scoperDefFile = FileUtil.pretty(
            scoperDefTemplate.generateScoperDef(this.language, scopedef, relativePath),
            "Scoper Definition",
            generationStatus,
        );
        fs.writeFileSync(`${this.scoperGenFolder}/${Names.scoperDef(this.language)}.ts`, scoperDefFile);

        LOGGER.log(`Generating custom scoper: ${this.scoperGenFolder}/${Names.customScoper(this.language)}.ts`);
        const scoperCustomFile = FileUtil.pretty(
            customScoperTemplate.generateCustomScoperPart(this.language),
            "Custom Scoper",
            generationStatus,
        );
        FileUtil.generateManualFile(
            `${this.scoperFolder}/${Names.customScoper(this.language)}.ts`,
            scoperCustomFile,
            "Custom Scoper",
        );

        LOGGER.log(`Generating scoper gen index: ${this.scoperGenFolder}/index.ts`);
        const scoperGenIndexFile = FileUtil.pretty(
            scoper.generateGenIndex(this.language),
            "Scoper Gen Index",
            generationStatus,
        );
        fs.writeFileSync(`${this.scoperGenFolder}/index.ts`, scoperGenIndexFile);

        LOGGER.log(`Generating scoper index: ${this.scoperFolder}/index.ts`);
        const scoperIndexFile = FileUtil.pretty(scoper.generateIndex(this.language), "Scoper Index", generationStatus);
        FileUtil.generateManualFile(`${this.scoperFolder}/index.ts`, scoperIndexFile, "Scoper Index");

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(`Generated scoper with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Succesfully generated scoper`);
        }
    }

    private getFolderNames() {
        this.scoperFolder = this.outputfolder + "/" + SCOPER_FOLDER;
        this.scoperGenFolder = this.outputfolder + "/" + SCOPER_GEN_FOLDER;
    }

    clean(force: boolean) {
        this.getFolderNames();
        FileUtil.deleteDirAndContent(this.scoperGenFolder);
        if (force) {
            FileUtil.deleteDirAndContent(this.scoperFolder);
        } else {
            FileUtil.deleteDirIfEmpty(this.scoperFolder);
        }
    }
}
