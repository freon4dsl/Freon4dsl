import * as fs from "fs";
import { MetaLogger } from "../../utils";
import { PiLanguage } from "../../languagedef/metalanguage";
import { GenerationStatus, FileUtil, isNullOrUndefined, Names, SCOPER_FOLDER, SCOPER_GEN_FOLDER } from "../../utils";
import { PiScopeDef } from "../metalanguage";
import { ScoperDefTemplate } from "./templates/ScoperDefTemplate";
import { ScoperTemplate } from "./templates/ScoperTemplate";
import { PiElementReference } from "../../languagedef/metalanguage";
import { PiModelDescription } from "../../languagedef/metalanguage/PiLanguage";

const LOGGER = new MetaLogger("ScoperGenerator").mute();
export class ScoperGenerator {
    public outputfolder: string = ".";
    public language: PiLanguage;
    protected scoperGenFolder: string;
    protected scoperFolder: string;

    generate(scopedef: PiScopeDef): void {
        if (this.language == null) {
            LOGGER.error("Cannot generate scoper because language is not set.");
            return;
        }
        // generate default, if the scoper definition is not present, i.e. was not read from file
        if (isNullOrUndefined(scopedef)) {
            scopedef = new PiScopeDef();
            scopedef.languageName = this.language.name;
            scopedef.namespaces = [];
            scopedef.namespaces.push(PiElementReference.create<PiModelDescription>(this.language.modelConcept, "PiModelDescription"));
        }

        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        const name = scopedef ? scopedef.scoperName + " " : "";
        LOGGER.log("Generating scoper " + name + "in folder " + this.scoperGenFolder);

        const scoper = new ScoperTemplate();
        const scoperDefTemplate = new ScoperDefTemplate();

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.scoperFolder);
        FileUtil.createDirIfNotExisting(this.scoperGenFolder);
        FileUtil.deleteFilesInDir(this.scoperGenFolder, generationStatus);

        // set relative path to get the imports right
        const relativePath = "../../";

        //  Generate it
        LOGGER.log(`Generating scoper: ${this.scoperGenFolder}/${Names.scoper(this.language)}.ts`);
        let scoperFile = FileUtil.pretty(scoper.generateScoper(this.language, scopedef, relativePath), "Scoper Class" , generationStatus);
        fs.writeFileSync(`${this.scoperGenFolder}/${Names.scoper(this.language)}.ts`, scoperFile);

        LOGGER.log(`Generating scope language definition: ${this.scoperGenFolder}/${Names.scoperDef(this.language)}.ts`);
        const scoperDefFile = FileUtil.pretty(scoperDefTemplate.generateEditorDef(this.language, scopedef), "Scoper Definition", generationStatus);
        fs.writeFileSync(`${this.scoperGenFolder}/${Names.scoperDef(this.language)}.ts`, scoperDefFile);

        LOGGER.log(`Generating scoper gen index: ${this.scoperGenFolder}/index.ts`);
        const scoperIndexFile = FileUtil.pretty(scoper.generateIndex(this.language), "Scoper Gen Index", generationStatus);
        fs.writeFileSync(`${this.scoperGenFolder}/index.ts`, scoperIndexFile);

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
