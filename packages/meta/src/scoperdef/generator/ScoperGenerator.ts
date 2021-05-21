// import { isNullOrUndefined } from "@projectit/core";
import * as fs from "fs";
import { MetaLogger } from "../../utils/MetaLogger";
import { PiConcept, PiLanguage } from "../../languagedef/metalanguage";
import { GenerationStatus, Helpers, isNullOrUndefined, Names, SCOPER_FOLDER, SCOPER_GEN_FOLDER } from "../../utils";
import { PiScopeDef } from "../metalanguage";
import { NamespaceTemplate } from "./templates/NamespaceTemplate";
import { ScoperTemplate } from "./templates/ScoperTemplate";
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";
import { ScoperUtilsTemplate } from "./templates/ScoperUtilsTemplate";
import { NamesCollectorTemplate } from "./templates/NamesCollectorTemplate";

const LOGGER = new MetaLogger("ScoperGenerator"); // .mute();
export class ScoperGenerator {
    public outputfolder: string = ".";
    public language: PiLanguage;
    protected scoperGenFolder: string;
    protected scoperFolder: string;

    constructor(language: PiLanguage) {
        this.language = language;
    }

    generate(scopedef: PiScopeDef): void {

        // generate default, if the scoper definition is not present, i.e. was not read from file
        if (isNullOrUndefined(scopedef)) {
            scopedef = new PiScopeDef();
            scopedef.languageName = this.language.name;
            scopedef.namespaces = [];
            scopedef.namespaces.push(PiElementReference.create<PiConcept>(this.language.modelConcept, "PiConcept"));
        }

        const generationStatus = new GenerationStatus();
        this.scoperFolder = this.outputfolder + "/" + SCOPER_FOLDER;
        this.scoperGenFolder = this.outputfolder + "/" + SCOPER_GEN_FOLDER;
        const name = scopedef ? scopedef.scoperName + " " : "";
        LOGGER.log("Generating scoper " + name + "in folder " + this.scoperGenFolder);

        const namespace = new NamespaceTemplate();
        const scoper = new ScoperTemplate();
        const utils = new ScoperUtilsTemplate();
        const namesCollector = new NamesCollectorTemplate();

        // Prepare folders
        Helpers.createDirIfNotExisting(this.scoperFolder);
        Helpers.createDirIfNotExisting(this.scoperGenFolder);
        Helpers.deleteFilesInDir(this.scoperGenFolder, generationStatus);

        // set relative path to get the imports right
        const relativePath = "../../";

        //  Generate it
        LOGGER.log(`Generating namespace: ${this.scoperGenFolder}/${Names.namespace(this.language)}.ts`);
        const namespaceFile = Helpers.pretty(namespace.generateNamespace(this.language, scopedef, relativePath), "Namespace Class" , generationStatus);
        fs.writeFileSync(`${this.scoperGenFolder}/${Names.namespace(this.language)}.ts`, namespaceFile);

        LOGGER.log(`Generating scoper: ${this.scoperGenFolder}/${Names.scoper(this.language)}.ts`);
        let scoperFile = Helpers.pretty(scoper.generateScoper(this.language, scopedef, relativePath), "Scoper Class" , generationStatus);
        fs.writeFileSync(`${this.scoperGenFolder}/${Names.scoper(this.language)}.ts`, scoperFile);

        LOGGER.log(`Generating scoper utils: ${this.scoperGenFolder}/${Names.scoperUtils(this.language)}.ts`);
        scoperFile = Helpers.pretty(utils.generateScoperUtils(this.language, scopedef, relativePath), "Scoper Utils" , generationStatus);
        fs.writeFileSync(`${this.scoperGenFolder}/${Names.scoperUtils(this.language)}.ts`, scoperFile);

        LOGGER.log(`Generating names collector: ${this.scoperGenFolder}/${Names.namesCollector(this.language)}.ts`);
        scoperFile = Helpers.pretty(namesCollector.generateNamesCollector(this.language, relativePath), "Names Collector" , generationStatus);
        fs.writeFileSync(`${this.scoperGenFolder}/${Names.namesCollector(this.language)}.ts`, scoperFile);

        LOGGER.log(`Generating scoper gen index: ${this.scoperGenFolder}/index.ts`);
        const scoperIndexFile = Helpers.pretty(scoper.generateIndex(this.language), "Scoper Gen Index", generationStatus);
        fs.writeFileSync(`${this.scoperGenFolder}/index.ts`, scoperIndexFile);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(this, `Generated scoper '${name}' with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(this,`Succesfully generated scoper ${name}`);
        }
    }
}
