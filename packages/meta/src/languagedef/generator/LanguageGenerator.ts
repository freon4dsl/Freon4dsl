import * as fs from "fs";
import { MetaLogger } from "../../utils/MetaLogger";
import {
    CONFIGURATION_FOLDER,
    ENVIRONMENT_FOLDER,
    ENVIRONMENT_GEN_FOLDER,
    GenerationStatus,
    Helpers,
    LANGUAGE_FOLDER,
    LANGUAGE_GEN_FOLDER,
    LANGUAGE_UTILS_FOLDER,
    LANGUAGE_UTILS_GEN_FOLDER,
    Names,
    STDLIB_FOLDER,
    STDLIB_GEN_FOLDER
} from "../../utils";
import { PiLanguage } from "../metalanguage";
import {
    AllConceptsTemplate,
    ConceptTemplate,
    EnvironmentTemplate,
    IndexTemplate,
    LanguageTemplate,
    MetaTypeTemplate,
    PiReferenceTemplate,
    WalkerTemplate,
    WorkerInterfaceTemplate,
    DefaultWorkerTemplate,
    InterfaceTemplate,
    StdlibTemplate
} from "./templates";
import { ConfigurationTemplate } from "./templates/ConfigurationTemplate";
import { ModelTemplate } from "./templates/ModelTemplate";
import { UnitTemplate } from "./templates/UnitTemplate";

const LOGGER = new MetaLogger("LanguageGenerator").mute();
export class LanguageGenerator {
    public outputfolder: string = ".";
    private languageGenFolder: string;
    private environmentGenFolder: string;
    private utilsGenFolder: string;
    private stdlibGenFolder: string;
    private configurationFolder: string;
    private languageFolder: string;
    private utilsFolder: string;
    private environmentFolder: string;
    private stdlibFolder: string;

    generate(language: PiLanguage): void {
        LOGGER.log("Generating language '" + language.name + "' in folder " + this.outputfolder + "/" + LANGUAGE_GEN_FOLDER);
        const generationStatus = new GenerationStatus();
        this.getFolderNames();

        const modelTemplate = new ModelTemplate();
        const unitTemplate = new UnitTemplate();
        const conceptTemplate = new ConceptTemplate();
        const languageTemplate = new LanguageTemplate();
        const metaTypeTemplate = new MetaTypeTemplate();
        const interfaceTemplate = new InterfaceTemplate();
        const languageIndexTemplate = new IndexTemplate();
        const allConceptsTemplate = new AllConceptsTemplate();
        const piReferenceTemplate = new PiReferenceTemplate();
        const environmentTemplate = new EnvironmentTemplate();
        const stdlibTemplate = new StdlibTemplate();
        const walkerTemplate = new WalkerTemplate();
        const workerTemplate = new WorkerInterfaceTemplate();
        const defaultWorkerTemplate = new DefaultWorkerTemplate();
        const configurationTemplate = new ConfigurationTemplate();

        // Prepare folders
        Helpers.createDirIfNotExisting(this.languageGenFolder);
        Helpers.createDirIfNotExisting(this.utilsGenFolder);
        Helpers.createDirIfNotExisting(this.environmentGenFolder);
        Helpers.createDirIfNotExisting(this.stdlibGenFolder);
        Helpers.createDirIfNotExisting(this.configurationFolder);
        // do not delete files in configurationFolder, because these may contain user edits
        Helpers.deleteFilesInDir(this.languageGenFolder, generationStatus);
        Helpers.deleteFilesInDir(this.utilsGenFolder, generationStatus);
        Helpers.deleteFilesInDir(this.environmentGenFolder, generationStatus);
        Helpers.deleteFilesInDir(this.stdlibGenFolder, generationStatus);

        // set relative path to get the imports right
        let relativePath = "../";

        //  Generate it
        LOGGER.log(`Generating model: ${this.languageGenFolder}/${Names.classifier(language.modelConcept)}.ts`);
        const generated = Helpers.pretty(modelTemplate.generateModel(language.modelConcept), "concept " + language.modelConcept.name, generationStatus);
        fs.writeFileSync(`${this.languageGenFolder}/${Names.classifier(language.modelConcept)}.ts`, generated);

        language.units.forEach(unit => {
            LOGGER.log(`Generating concept: ${this.languageGenFolder}/${Names.classifier(unit)}.ts`);
            const generated = Helpers.pretty(unitTemplate.generateUnit(unit), "concept " + unit.name, generationStatus);
            fs.writeFileSync(`${this.languageGenFolder}/${Names.classifier(unit)}.ts`, generated);
        });

        language.concepts.forEach(concept => {
            LOGGER.log(`Generating concept: ${this.languageGenFolder}/${Names.concept(concept)}.ts`);
            const generated = Helpers.pretty(conceptTemplate.generateConcept(concept), "concept " + concept.name, generationStatus);
            fs.writeFileSync(`${this.languageGenFolder}/${Names.concept(concept)}.ts`, generated);
        });

        language.interfaces.forEach(piInterface => {
            LOGGER.log(`Generating interface: ${this.languageGenFolder}/${Names.interface(piInterface)}.ts`);
            const generated = Helpers.pretty(interfaceTemplate.generateInterface(piInterface, relativePath), "interface " + piInterface.name, generationStatus);
            fs.writeFileSync(`${this.languageGenFolder}/${Names.interface(piInterface)}.ts`, generated);
        });

        // the following classes do not need the relative path for their imports
        LOGGER.log(`Generating metatype info: ${this.languageGenFolder}/${Names.metaType(language)}.ts`);
        const languageFile = Helpers.pretty(metaTypeTemplate.generateMetaType(language), "Model info", generationStatus);
        fs.writeFileSync(`${this.languageGenFolder}/${Names.metaType(language)}.ts`, languageFile);

        LOGGER.log(`Generating metatype class: ${this.languageGenFolder}/${Names.allConcepts(language)}.ts`);
        const allConceptsFile = Helpers.pretty(allConceptsTemplate.generateAllConceptsClass(language), "All Concepts Class", generationStatus);
        fs.writeFileSync(`${this.languageGenFolder}/${Names.allConcepts(language)}.ts`, allConceptsFile);

        LOGGER.log(`Generating language external index: ${this.languageGenFolder}/index.ts`);
        const languageIndexFile = Helpers.pretty(languageIndexTemplate.generateIndex(language), "Language Index", generationStatus);
        fs.writeFileSync(`${this.languageGenFolder}/index.ts`, languageIndexFile);

        LOGGER.log(`Generating language internal index: ${this.languageGenFolder}/internal.ts`);
        const internalIndexFile = Helpers.pretty(languageIndexTemplate.generateInternal(language), "Language Index", generationStatus);
        fs.writeFileSync(`${this.languageGenFolder}/internal.ts`, internalIndexFile);

        // Generate projectit configuration if it isn't there
        LOGGER.log(`Generating ProjectIt Configuration: ${this.configurationFolder}/${Names.configuration()}.ts`);
        const configurationFile = Helpers.pretty(configurationTemplate.generate(language, relativePath), "Configuration", generationStatus);
        Helpers.generateManualFile(`${this.configurationFolder}/${Names.configuration()}.ts`, configurationFile, "Configuration");

        // set relative path to an extra level to get the imports right
        relativePath = "../../";

        LOGGER.log(`Generating PiElementReference: ${this.languageGenFolder}/${Names.PiElementReference}.ts`);
        const referenceFile = Helpers.pretty(piReferenceTemplate.generatePiReference(language, relativePath), "PiElementReference", generationStatus);
        fs.writeFileSync(`${this.languageGenFolder}/${Names.PiElementReference}.ts`, referenceFile);

        LOGGER.log(`Generating language structure information: ${this.languageGenFolder}/${Names.language(language)}.ts`);
        const structureFile = Helpers.pretty(languageTemplate.generateLanguage(language), "Language Structure", generationStatus);
        fs.writeFileSync(`${this.languageGenFolder}/${Names.language(language)}.ts`, structureFile);

        LOGGER.log(`Generating language environment: ${this.environmentGenFolder}/${Names.environment(language)}.ts`);
        const environmentFile = Helpers.pretty(environmentTemplate.generateEnvironment(language, relativePath), "Language Environment", generationStatus);
        fs.writeFileSync(`${this.environmentGenFolder}/${Names.environment(language)}.ts`, environmentFile);

        LOGGER.log(`Generating standard library: ${this.stdlibGenFolder}/${Names.stdlib(language)}.ts`);
        const stdlibFile = Helpers.pretty(stdlibTemplate.generateStdlibClass(language, relativePath), "Language Standard Library", generationStatus);
        fs.writeFileSync(`${this.stdlibGenFolder}/${Names.stdlib(language)}.ts`, stdlibFile);

        // generate the utility classes
        LOGGER.log(`Generating user model walker: ${this.utilsGenFolder}/${Names.walker(language)}.ts`);
        const walkerFile = Helpers.pretty(walkerTemplate.generateWalker(language, relativePath), "Walker Class", generationStatus);
        fs.writeFileSync(`${this.utilsGenFolder}/${Names.walker(language)}.ts`, walkerFile);

        LOGGER.log(`Generating user model worker interface: ${this.utilsGenFolder}/${Names.workerInterface(language)}.ts`);
        const workerFile = Helpers.pretty(workerTemplate.generateWorkerInterface(language, relativePath), "Worker Interface", generationStatus);
        fs.writeFileSync(`${this.utilsGenFolder}/${Names.workerInterface(language)}.ts`, workerFile);

        LOGGER.log(`Generating user model worker: ${this.utilsGenFolder}/${Names.defaultWorker(language)}.ts`);
        const defaultWorkerFile = Helpers.pretty(defaultWorkerTemplate.generateDefaultWorker(language, relativePath), "DefaultWorker Class", generationStatus);
        fs.writeFileSync(`${this.utilsGenFolder}/${Names.defaultWorker(language)}.ts`, defaultWorkerFile);

        LOGGER.log(`Generating utils index: ${this.utilsGenFolder}/index.ts`);
        const utilIndexFile = Helpers.pretty(languageIndexTemplate.generateUtilsIndex(language), "Utils Index", generationStatus);
        fs.writeFileSync(`${this.utilsGenFolder}/index.ts`, utilIndexFile);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.info(this, `Generated language '${language.name}' with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(this, `Succesfully generated language '${language.name}'`);
        }
    }

    private getFolderNames() {
        this.languageGenFolder = this.outputfolder + "/" + LANGUAGE_GEN_FOLDER;
        this.utilsGenFolder = this.outputfolder + "/" + LANGUAGE_UTILS_GEN_FOLDER;
        this.environmentGenFolder = this.outputfolder + "/" + ENVIRONMENT_GEN_FOLDER;
        this.stdlibGenFolder = this.outputfolder + "/" + STDLIB_GEN_FOLDER;
        this.languageFolder = this.outputfolder + "/" + LANGUAGE_FOLDER;
        this.utilsFolder = this.outputfolder + "/" + LANGUAGE_UTILS_FOLDER;
        this.environmentFolder = this.outputfolder + "/" + ENVIRONMENT_FOLDER;
        this.stdlibFolder = this.outputfolder + "/" + STDLIB_FOLDER;
        this.configurationFolder = this.outputfolder + "/" + CONFIGURATION_FOLDER;
    }

    clean(force: boolean) {
        this.getFolderNames();
        Helpers.deleteDirAndContent(this.languageGenFolder);
        Helpers.deleteDirAndContent(this.utilsGenFolder);
        Helpers.deleteDirAndContent(this.environmentGenFolder);
        Helpers.deleteDirAndContent(this.stdlibGenFolder);
        Helpers.deleteDirIfEmpty(this.languageFolder);
        Helpers.deleteDirIfEmpty(this.utilsFolder);
        Helpers.deleteDirIfEmpty(this.environmentFolder);
        Helpers.deleteDirIfEmpty(this.stdlibFolder);
        if (force) {
            Helpers.deleteFile(`${this.configurationFolder}/${Names.configuration()}.ts`);
            Helpers.deleteDirIfEmpty(this.configurationFolder);
        } else {
            // do not delete the following files, because these may contain user edits
            LOGGER.info(this, `Not removed: ${this.configurationFolder}/${Names.configuration()}.ts`);
        }
    }
}
