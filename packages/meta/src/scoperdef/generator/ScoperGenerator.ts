import * as fs from "fs";
import { MetaLogger } from "../../utils";
import { FreMetaLanguage } from "../../languagedef/metalanguage";
import { GenerationStatus, FileUtil, isNullOrUndefined, Names, SCOPER_FOLDER, SCOPER_GEN_FOLDER } from "../../utils";
import { ScopeDef } from "../metalanguage";
import { CustomScoperTemplate } from "./templates/CustomScoperTemplate";
import { ScoperDefTemplate } from "./templates/ScoperDefTemplate";
import { ScoperTemplate } from "./templates/ScoperTemplate";
import { MetaElementReference } from "../../languagedef/metalanguage";
import { FreMetaModelDescription } from "../../languagedef/metalanguage/FreMetaLanguage";

const LOGGER = new MetaLogger("ScoperGenerator").mute();
export class ScoperGenerator {
    public outputfolder: string = ".";
    public language: FreMetaLanguage;
    protected scoperGenFolder: string;
    protected scoperFolder: string;

    generate(scopedef: ScopeDef): void {
        if (this.language === null) {
            LOGGER.error("Cannot generate scoper because language is not set.");
            return;
        }
        // generate default, if the scoper definition is not present, i.e. was not read from file
        if (isNullOrUndefined(scopedef)) {
            scopedef = new ScopeDef();
            scopedef.languageName = this.language.name;
            scopedef.namespaces = [];
            scopedef.namespaces.push(MetaElementReference.create<FreMetaModelDescription>(this.language.modelConcept, "FreModelDescription"));
        }

        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        const name = scopedef ? scopedef.scoperName + " " : "";
        LOGGER.log("Generating scoper " + name + "in folder " + this.scoperGenFolder);

        const scoper = new ScoperTemplate();
        const scoperDefTemplate = new ScoperDefTemplate();
        const customScoperTemplate = new CustomScoperTemplate();

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.scoperFolder);
        FileUtil.createDirIfNotExisting(this.scoperGenFolder);
        FileUtil.deleteFilesInDir(this.scoperGenFolder, generationStatus);

        // set relative path to get the imports right
        const relativePath = "../../";

        //  Generate it
        LOGGER.log(`Generating scoper: ${this.scoperGenFolder}/${Names.scoper(this.language)}.ts`);
        const scoperFile = FileUtil.pretty(scoper.generateScoper(this.language, scopedef, relativePath), "Scoper Class" , generationStatus);
        fs.writeFileSync(`${this.scoperGenFolder}/${Names.scoper(this.language)}.ts`, scoperFile);

        LOGGER.log(`Generating scope language definition: ${this.scoperGenFolder}/${Names.scoperDef(this.language)}.ts`);
        const scoperDefFile = FileUtil.pretty(
            scoperDefTemplate.generateScoperDef(this.language, scopedef, relativePath),
            "Scoper Definition",
            generationStatus
        );
        fs.writeFileSync(`${this.scoperGenFolder}/${Names.scoperDef(this.language)}.ts`, scoperDefFile);

        LOGGER.log(`Generating custom scoper: ${this.scoperGenFolder}/${Names.customScoper(this.language)}.ts`);
        const scoperCustomFile = FileUtil.pretty(customScoperTemplate.generateCustomScoperPart(this.language, relativePath), "Custom Scoper", generationStatus);
        FileUtil.generateManualFile(`${this.scoperFolder}/${Names.customScoper(this.language)}.ts`, scoperCustomFile, "Custom Scoper");

        LOGGER.log(`Generating scoper gen index: ${this.scoperGenFolder}/index.ts`);
        const scoperGenIndexFile = FileUtil.pretty(scoper.generateGenIndex(this.language), "Scoper Gen Index", generationStatus);
        fs.writeFileSync(`${this.scoperGenFolder}/index.ts`, scoperGenIndexFile);

        LOGGER.log(`Generating scoper index: ${this.scoperFolder}/index.ts`);
        const scoperIndexFile = FileUtil.pretty(scoper.generateIndex(this.language), "Scoper Index", generationStatus);
        FileUtil.generateManualFile(`${this.scoperFolder}/index.ts`, scoperIndexFile, "Scoper Index");

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(`Generated scoper '${name}' with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Succesfully generated scoper ${name}`);
        }
    }

    private getFolderNames() {
        this.scoperFolder = this.outputfolder + "/" + SCOPER_FOLDER;
        this.scoperGenFolder = this.outputfolder + "/" + SCOPER_GEN_FOLDER;
    }

    clean(force: boolean) {
        this.getFolderNames();
        FileUtil.deleteDirAndContent(this.scoperGenFolder);
        FileUtil.deleteDirIfEmpty(this.scoperFolder);
    }
}
