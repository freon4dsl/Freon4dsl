import * as fs from "fs";
import { MetaLogger, LOG2USER, COMMAND_LINE_FOLDER } from "../../utils/index.js";
import {
    CONFIGURATION_FOLDER,
    CONFIGURATION_GEN_FOLDER,
    GenerationStatus,
    FileUtil,
    LANGUAGE_FOLDER,
    LANGUAGE_GEN_FOLDER,
    LANGUAGE_UTILS_FOLDER,
    LANGUAGE_UTILS_GEN_FOLDER,
    Names,
    STDLIB_FOLDER,
    STDLIB_GEN_FOLDER,
} from "../../utils/index.js";
import { FreMetaLanguage } from "../metalanguage/index.js";
import {
    // AllConceptsTemplate,
    ConceptTemplate,
    EnvironmentTemplate,
    IndexTemplate,
    LanguageTemplate,
    WalkerTemplate,
    WorkerInterfaceTemplate,
    DefaultWorkerTemplate,
    InterfaceTemplate,
    StdlibTemplate,
} from "./templates/index.js";
import { CommandLineTemplate } from "./templates/CommandLineTemplate.js";
import { ConfigurationTemplate } from "./templates/ConfigurationTemplate.js";
import { ModelTemplate } from "./templates/ModelTemplate.js";
import { RootIndexTemplate } from "./templates/RootIndexTemplate.js";
import { UnitTemplate } from "./templates/UnitTemplate.js";
import { ListUtilTemplate } from "./templates/ListUtilTemplate.js";

const LOGGER = new MetaLogger("LanguageGenerator").mute();
export class LanguageGenerator {
    public outputfolder: string = ".";
    private languageGenFolder: string = "";
    private utilsGenFolder: string = "";
    private stdlibGenFolder: string = "";
    private configurationFolder: string = "";
    private configurationGenFolder: string = "";
    private languageFolder: string = "";
    private utilsFolder: string = "";
    private stdlibFolder: string = "";
    private commandlineFolder: string = "";

    generate(language: FreMetaLanguage): void {
        LOGGER.log(
            "Generating language '" + language.name + "' in folder " + this.outputfolder + "/" + LANGUAGE_GEN_FOLDER,
        );
        const generationStatus = new GenerationStatus();
        this.getFolderNames();

        const modelTemplate = new ModelTemplate();
        const unitTemplate = new UnitTemplate();
        const conceptTemplate = new ConceptTemplate();
        const languageTemplate = new LanguageTemplate();
        // const metaTypeTemplate = new MetaTypeTemplate();
        const interfaceTemplate = new InterfaceTemplate();
        const languageIndexTemplate = new IndexTemplate();
        // const allConceptsTemplate = new AllConceptsTemplate();
        const environmentTemplate = new EnvironmentTemplate();
        const rootIndexTemplate = new RootIndexTemplate()
        const stdlibTemplate = new StdlibTemplate();
        const walkerTemplate = new WalkerTemplate();
        const workerTemplate = new WorkerInterfaceTemplate();
        const defaultWorkerTemplate = new DefaultWorkerTemplate();
        const listTemplate = new ListUtilTemplate();
        const configurationTemplate = new ConfigurationTemplate();
        const commandLineTemplate = new CommandLineTemplate();

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.configurationFolder);
        FileUtil.createDirIfNotExisting(this.languageGenFolder);
        FileUtil.createDirIfNotExisting(this.configurationGenFolder);
        FileUtil.createDirIfNotExisting(this.utilsGenFolder);
        FileUtil.createDirIfNotExisting(this.stdlibGenFolder);
        FileUtil.createDirIfNotExisting(this.commandlineFolder);
        // do not delete files in configurationFolder, because these may contain user edits
        FileUtil.deleteFilesInDir(this.languageGenFolder, generationStatus);
        FileUtil.deleteFilesInDir(this.configurationGenFolder, generationStatus);
        FileUtil.deleteFilesInDir(this.utilsGenFolder, generationStatus);
        FileUtil.deleteFilesInDir(this.stdlibGenFolder, generationStatus);

        // set relative path to get the imports right
        let relativePath = "../";

        //  Generate it
        LOGGER.log(`Generating model: ${this.languageGenFolder}/${Names.classifier(language.modelConcept)}.ts`);
        const generated = FileUtil.pretty(
            modelTemplate.generateModel(language.modelConcept),
            "concept " + language.modelConcept.name,
            generationStatus,
        );
        fs.writeFileSync(`${this.languageGenFolder}/${Names.classifier(language.modelConcept)}.ts`, generated);

        language.units.forEach((unit) => {
            LOGGER.log(`Generating concept: ${this.languageGenFolder}/${Names.classifier(unit)}.ts`);
            const innerGenerated = FileUtil.pretty(
                unitTemplate.generateUnit(unit),
                "concept " + unit.name,
                generationStatus,
            );
            fs.writeFileSync(`${this.languageGenFolder}/${Names.classifier(unit)}.ts`, innerGenerated);
        });

        language.concepts.forEach((concept) => {
            LOGGER.log(`Generating concept: ${this.languageGenFolder}/${Names.concept(concept)}.ts`);
            const innerGenerated = FileUtil.pretty(
                conceptTemplate.generateConcept(concept),
                "concept " + concept.name,
                generationStatus,
            );
            fs.writeFileSync(`${this.languageGenFolder}/${Names.concept(concept)}.ts`, innerGenerated);
        });

        language.interfaces.forEach((freInterface) => {
            LOGGER.log(`Generating interface: ${this.languageGenFolder}/${Names.interface(freInterface)}.ts`);
            const innerGenerated = FileUtil.pretty(
                interfaceTemplate.generateInterface(freInterface),
                "interface " + freInterface.name,
                generationStatus,
            );
            fs.writeFileSync(`${this.languageGenFolder}/${Names.interface(freInterface)}.ts`, innerGenerated);
        });

        // the following classes do not need the relative path for their imports
        // LOGGER.log(`Generating metatype info: ${this.languageGenFolder}/${Names.metaType(language)}.ts`);
        // const languageFile = FileUtil.pretty(metaTypeTemplate.generateMetaType(language), "Model info", generationStatus);
        // fs.writeFileSync(`${this.languageGenFolder}/${Names.metaType(language)}.ts`, languageFile);

        // LOGGER.log(`Generating metatype class: ${this.languageGenFolder}/${Names.allConcepts(language)}.ts`);
        // const allConceptsFile = FileUtil.pretty(allConceptsTemplate.generateAllConceptsClass(language), "All Concepts Class", generationStatus);
        // fs.writeFileSync(`${this.languageGenFolder}/${Names.allConcepts(language)}.ts`, allConceptsFile);

        LOGGER.log(`Generating language external index: ${this.languageGenFolder}/index.ts`);
        const languageIndexFile = FileUtil.pretty(
            languageIndexTemplate.generateIndex(language),
            "Language Index",
            generationStatus,
        );
        fs.writeFileSync(`${this.languageGenFolder}/index.ts`, languageIndexFile);

        LOGGER.log(`Generating language internal index: ${this.languageGenFolder}/internal.ts`);
        const internalIndexFile = FileUtil.pretty(
            languageIndexTemplate.generateInternal(language),
            "Language Index",
            generationStatus,
        );
        fs.writeFileSync(`${this.languageGenFolder}/internal.ts`, internalIndexFile);

        // Generate Freon configuration if it isn't there
        LOGGER.log(`Generating Freon Configuration: ${this.configurationFolder}/${Names.configuration}.ts`);
        const configurationFile = FileUtil.pretty(
            configurationTemplate.generate(language, relativePath),
            "Configuration",
            generationStatus,
        );
        FileUtil.generateManualFile(
            `${this.configurationFolder}/${Names.configuration}.ts`,
            configurationFile,
            "Configuration",
        );

        // set relative path to an extra level to get the imports right
        relativePath = "../../";

        // LOGGER.log(`Generating FreNodeReference: ${this.languageGenFolder}/${Names.FreElementReference}.ts`);
        // const referenceFile = FileUtil.pretty(freReferenceTemplate.generateFreReference(language, relativePath), "FreElementReference", generationStatus);
        // fs.writeFileSync(`${this.languageGenFolder}/${Names.FreElementReference}.ts`, referenceFile);

        LOGGER.log(
            `Generating language structure information: ${this.languageGenFolder}/${Names.language(language)}.ts`,
        );
        const structureFile = FileUtil.pretty(
            languageTemplate.generateLanguage(language, relativePath),
            "Language Structure",
            generationStatus,
        );
        fs.writeFileSync(`${this.languageGenFolder}/${Names.language(language)}.ts`, structureFile);

        LOGGER.log(`Generating language environment: ${this.configurationGenFolder}/${Names.environment(language)}.ts`);
        const environmentFile = FileUtil.pretty(
            environmentTemplate.generateEnvironment(language, relativePath),
            "Language Environment",
            generationStatus,
        );
        fs.writeFileSync(`${this.configurationGenFolder}/${Names.environment(language)}.ts`, environmentFile);

        LOGGER.log(`Generating standard library: ${this.stdlibGenFolder}/${Names.stdlib(language)}.ts`);
        const stdlibFile = FileUtil.pretty(
            stdlibTemplate.generateStdlibClass(language, relativePath),
            "Language Standard Library",
            generationStatus,
        );
        fs.writeFileSync(`${this.stdlibGenFolder}/${Names.stdlib(language)}.ts`, stdlibFile);

        // generate the utility classes
        LOGGER.log(`Generating user model walker: ${this.utilsGenFolder}/${Names.walker(language)}.ts`);
        const walkerFile = FileUtil.pretty(
            walkerTemplate.generateWalker(language, relativePath),
            "Walker Class",
            generationStatus,
        );
        fs.writeFileSync(`${this.utilsGenFolder}/${Names.walker(language)}.ts`, walkerFile);

        LOGGER.log(
            `Generating user model worker interface: ${this.utilsGenFolder}/${Names.workerInterface(language)}.ts`,
        );
        const workerFile = FileUtil.pretty(
            workerTemplate.generateWorkerInterface(language, relativePath),
            "Worker Interface",
            generationStatus,
        );
        fs.writeFileSync(`${this.utilsGenFolder}/${Names.workerInterface(language)}.ts`, workerFile);

        LOGGER.log(`Generating user model worker: ${this.utilsGenFolder}/${Names.defaultWorker(language)}.ts`);
        const defaultWorkerFile = FileUtil.pretty(
            defaultWorkerTemplate.generateDefaultWorker(language, relativePath),
            "DefaultWorker Class",
            generationStatus,
        );
        fs.writeFileSync(`${this.utilsGenFolder}/${Names.defaultWorker(language)}.ts`, defaultWorkerFile);

        LOGGER.log(`Generating list util: ${this.utilsGenFolder}/${Names.listUtil}.ts`);
        const listFile = FileUtil.pretty(listTemplate.generateListUtil(), "List Util Class", generationStatus);
        fs.writeFileSync(`${this.utilsGenFolder}/${Names.listUtil}.ts`, listFile);

        LOGGER.log(`Generating utils index: ${this.utilsGenFolder}/index.ts`);
        const utilIndexFile = FileUtil.pretty(
            languageIndexTemplate.generateUtilsIndex(language),
            "Utils Index",
            generationStatus,
        );
        fs.writeFileSync(`${this.utilsGenFolder}/index.ts`, utilIndexFile);

        {
            LOGGER.log(`Generating custom stdlib: ${this.stdlibFolder}/${Names.customStdlib(language)}.ts`);
            const customFile = FileUtil.pretty(
                stdlibTemplate.generateCustomStdlibClass(language),
                "Custom Stdlib Class",
                generationStatus,
            );
            FileUtil.generateManualFile(
                `${this.stdlibFolder}/${Names.customStdlib(language)}.ts`,
                customFile,
                "Custom Stdlib Class",
            );
        }
        {
            LOGGER.log(`Generating stdlib index: ${this.stdlibFolder}/index.ts`);
            const indexFile = FileUtil.pretty(
                stdlibTemplate.generateIndex(language),
                "Stdlib Index Class",
                generationStatus,
            );
            FileUtil.generateManualFile(`${this.stdlibFolder}/index.ts`, indexFile, "Stdlib Index Class");
        }

        LOGGER.log(`Generating command line: ${this.commandlineFolder}/FreonCommandLine.ts`);
        const commandLineFile = FileUtil.pretty(
            commandLineTemplate.generateCommandLine(),
            "CommandLine Class",
            generationStatus,
        );
        FileUtil.generateManualFile(
            `${this.commandlineFolder}/FreonCommandLine.ts`,
            commandLineFile,
            "CommandLine Class",
        );

        LOGGER.log(`Generating command line runner: ${this.commandlineFolder}/FreonCommandLineRunner.ts`);
        const commandLineRunnerFile = FileUtil.pretty(
            commandLineTemplate.generateCommandLineRunner(language),
            "CommandLineRunner Class",
            generationStatus,
        );
        FileUtil.generateManualFile(
            `${this.commandlineFolder}/FreonCommandLineRunner.ts`,
            commandLineRunnerFile,
            "CommandLineRunner Class",
        );

        LOGGER.log(`Generating dummy action: ${this.commandlineFolder}/DummyAction.ts`);
        const emptyActionFile = FileUtil.pretty(
            commandLineTemplate.generateEmptyAction(),
            "DummyAction Class",
            generationStatus,
        );
        FileUtil.generateManualFile(`${this.commandlineFolder}/DummyAction.ts`, emptyActionFile, "DummyAction Class");

        LOGGER.log(`Generating root index: ./index.ts`);
        const rootIndexFile = FileUtil.pretty(
            rootIndexTemplate.generateRootIndex(language),
            "Root Index",
            generationStatus,
        );
        fs.writeFileSync(`${this.outputfolder}/index.ts`, rootIndexFile);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.info(`Generated language '${language.name}' with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Succesfully generated language '${language.name}'`);
        }
    }

    private getFolderNames() {
        this.languageGenFolder = this.outputfolder + "/" + LANGUAGE_GEN_FOLDER;
        this.utilsGenFolder = this.outputfolder + "/" + LANGUAGE_UTILS_GEN_FOLDER;
        this.configurationGenFolder = this.outputfolder + "/" + CONFIGURATION_GEN_FOLDER;
        this.stdlibGenFolder = this.outputfolder + "/" + STDLIB_GEN_FOLDER;
        this.languageFolder = this.outputfolder + "/" + LANGUAGE_FOLDER;
        this.utilsFolder = this.outputfolder + "/" + LANGUAGE_UTILS_FOLDER;
        this.configurationFolder = this.outputfolder + "/" + CONFIGURATION_FOLDER;
        this.stdlibFolder = this.outputfolder + "/" + STDLIB_FOLDER;
        this.commandlineFolder = this.outputfolder + "/" + COMMAND_LINE_FOLDER;
    }

    clean(force: boolean) {
        this.getFolderNames();
        FileUtil.deleteDirAndContent(this.languageGenFolder);
        FileUtil.deleteDirAndContent(this.utilsGenFolder);
        FileUtil.deleteDirAndContent(this.configurationGenFolder);
        FileUtil.deleteDirAndContent(this.stdlibGenFolder);
        FileUtil.deleteDirIfEmpty(this.languageFolder);
        FileUtil.deleteDirIfEmpty(this.utilsFolder);
        FileUtil.deleteDirIfEmpty(this.stdlibFolder);
        if (force) {
            FileUtil.deleteFile(`${this.configurationFolder}/${Names.configuration}.ts`);
            FileUtil.deleteDirIfEmpty(this.configurationFolder);
        } else {
            // do not delete the following files, because these may contain user edits
            LOG2USER.info(`Not removed: ${this.configurationFolder}/${Names.configuration}.ts`);
        }
    }
}
