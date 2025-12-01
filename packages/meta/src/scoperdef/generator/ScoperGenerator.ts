import * as fs from "fs";
import { MetaLogger } from "../../utils/no-dependencies/index.js";
import { FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import {
    Names,
    SCOPER_FOLDER
} from "../../utils/on-lang/index.js";
import { ScopeDef } from "../metalanguage/index.js";
import { CustomScoperTemplate } from "./templates/CustomScoperTemplate.js";
import { ScoperDefTemplate } from "./templates/ScoperDefTemplate.js";
import { ScoperTemplate } from "./templates/ScoperTemplate.js";
import {
    GenerationStatus,
    FileUtil,
    isNullOrUndefined
} from '../../utils/file-utils/index.js';

const LOGGER: MetaLogger = new MetaLogger("ScoperGenerator").mute();
export class ScoperGenerator {
    public outputfolder: string = ".";
    public customsfolder: string = ".";
    public language: FreMetaLanguage | undefined;
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
            scopedef.namespaces = [this.language.modelConcept];
        }

        const generationStatus: GenerationStatus = new GenerationStatus();
        this.getFolderNames();
        LOGGER.log("Generating scoper in folder " + this.scoperFolder);

        const scoper: ScoperTemplate = new ScoperTemplate();
        const scoperDefTemplate: ScoperDefTemplate = new ScoperDefTemplate();
        const customScoperTemplate: CustomScoperTemplate = new CustomScoperTemplate();

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.outputfolder + this.customsfolder); // will not be overwritten
        FileUtil.createDirIfNotExisting(this.scoperFolder);
        FileUtil.deleteFilesInDir(this.scoperFolder, generationStatus);

        // set relative path to get the imports right
        const relativePath = "..";

        //  Generate it
        LOGGER.log(`Generating scoper: ${this.scoperFolder}/${Names.scoper(this.language)}.ts`);
        const scoperFile = FileUtil.pretty(
            scoper.generateScoper(this.language, scopedef, relativePath),
            "Scoper Class",
            generationStatus,
        );
        fs.writeFileSync(`${this.scoperFolder}/${Names.scoper(this.language)}.ts`, scoperFile);

        LOGGER.log(
            `Generating scope language definition: ${this.scoperFolder}/${Names.scoperDef(this.language)}.ts`,
        );
        const scoperDefFile = FileUtil.pretty(
            scoperDefTemplate.generateScoperDef(this.language, scopedef, this.customsfolder, relativePath),
            "Scoper Definition",
            generationStatus,
        );
        fs.writeFileSync(`${this.scoperFolder}/${Names.scoperDef(this.language)}.ts`, scoperDefFile);

        LOGGER.log(`Generating custom scoper: ${this.outputfolder}${this.customsfolder}/${Names.customScoper(this.language)}.ts`);
        const scoperCustomFile = FileUtil.pretty(
            customScoperTemplate.generateCustomScoperPart(this.language),
            "Custom Scoper",
            generationStatus,
        );
        FileUtil.generateManualFile(
            `${this.outputfolder}${this.customsfolder}/${Names.customScoper(this.language)}.ts`,
            scoperCustomFile,
            "Custom Scoper",
        );

        LOGGER.log(`Generating scoper gen index: ${this.scoperFolder}/index.ts`);
        const scoperGenIndexFile = FileUtil.pretty(
            scoper.generateGenIndex(this.language),
            "Scoper Gen Index",
            generationStatus,
        );
        fs.writeFileSync(`${this.scoperFolder}/index.ts`, scoperGenIndexFile);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(`Generated scoper with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Successfully generated scoper`);
        }
    }

    private getFolderNames() {
        this.scoperFolder = this.outputfolder + "/" + SCOPER_FOLDER;
    }
}
