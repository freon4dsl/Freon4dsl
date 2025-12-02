import * as fs from "fs";
import { MetaLogger } from "../../utils/no-dependencies/index.js";
import {
    COMMAND_LINE_FOLDER,
    CONFIGURATION_FOLDER,
    LANGUAGE_FOLDER,
    LANGUAGE_UTILS_FOLDER,
    Names,
    STDLIB_FOLDER
} from "../../utils/on-lang/index.js"
import { FileUtil, GenerationStatus } from '../../utils/file-utils/index.js';
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
import { getCombinedFolderPath } from '../../utils/no-dependencies/FolderPathHelper.js';

const LOGGER = new MetaLogger("LanguageGenerator").mute();
export class LanguageGenerator {
    public outputFolder: string = ".";
    public customsFolder: string = ".";
    private configurationFolder: string = "";
    private stdlibFolder: string = "";
    private commandlineFolder: string = "";
    private languageFolder: string = "";
    private utilsFolder: string = "";

    generate(language: FreMetaLanguage): void {
        LOGGER.log(
            "Generating language '" + language.name + "' in folder " + this.outputFolder + "/" + LANGUAGE_FOLDER,
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
        FileUtil.createDirIfNotExisting(this.outputFolder + this.customsFolder); // will not be overwritten
        FileUtil.createDirIfNotExisting(this.configurationFolder);
        FileUtil.createDirIfNotExisting(this.languageFolder);
        FileUtil.createDirIfNotExisting(this.configurationFolder);
        FileUtil.createDirIfNotExisting(this.utilsFolder);
        FileUtil.createDirIfNotExisting(this.stdlibFolder);
        FileUtil.createDirIfNotExisting(this.commandlineFolder);
        // do not delete files in configurationFolder, because these may contain user edits
        FileUtil.deleteFilesInDir(this.languageFolder, generationStatus);
        FileUtil.deleteFilesInDir(this.configurationFolder, generationStatus);
        FileUtil.deleteFilesInDir(this.utilsFolder, generationStatus);
        FileUtil.deleteFilesInDir(this.stdlibFolder, generationStatus);
        FileUtil.deleteFilesInDir(this.commandlineFolder, generationStatus);

        // set relative path to get the imports right
        let relativePath = "..";
        console.log('this.outputFolder', this.outputFolder)
        console.log('this.customsFolder', this.customsFolder)
        console.log('relativePath', relativePath);
        //  Generate it
        LOGGER.log(`Generating model: ${this.languageFolder}/${Names.classifier(language.modelConcept)}.ts`);
        const generated = FileUtil.pretty(
            modelTemplate.generateModel(language.modelConcept),
            "concept " + language.modelConcept.name,
            generationStatus,
        );
        fs.writeFileSync(`${this.languageFolder}/${Names.classifier(language.modelConcept)}.ts`, generated);

        language.units.forEach((unit) => {
            LOGGER.log(`Generating concept: ${this.languageFolder}/${Names.classifier(unit)}.ts`);
            const innerGenerated = FileUtil.pretty(
                unitTemplate.generateUnit(unit),
                "concept " + unit.name,
                generationStatus,
            );
            fs.writeFileSync(`${this.languageFolder}/${Names.classifier(unit)}.ts`, innerGenerated);
        });

        language.concepts.forEach((concept) => {
            LOGGER.log(`Generating concept: ${this.languageFolder}/${Names.concept(concept)}.ts`);
            const innerGenerated = FileUtil.pretty(
                conceptTemplate.generateConcept(concept),
                "concept " + concept.name,
                generationStatus,
            );
            fs.writeFileSync(`${this.languageFolder}/${Names.concept(concept)}.ts`, innerGenerated);
        });

        language.interfaces.forEach((freInterface) => {
            LOGGER.log(`Generating interface: ${this.languageFolder}/${Names.interface(freInterface)}.ts`);
            const innerGenerated = FileUtil.pretty(
                interfaceTemplate.generateInterface(freInterface),
                "interface " + freInterface.name,
                generationStatus,
            );
            fs.writeFileSync(`${this.languageFolder}/${Names.interface(freInterface)}.ts`, innerGenerated);
        });

        LOGGER.log(`Generating language external index: ${this.languageFolder}/index.ts`);
        const languageIndexFile = FileUtil.pretty(
            languageIndexTemplate.generateIndex(language),
            "Language Index",
            generationStatus,
        );
        fs.writeFileSync(`${this.languageFolder}/index.ts`, languageIndexFile);

        LOGGER.log(`Generating language internal index: ${this.languageFolder}/internal.ts`);
        const internalIndexFile = FileUtil.pretty(
            languageIndexTemplate.generateInternal(language),
            "Language Index",
            generationStatus,
        );
        fs.writeFileSync(`${this.languageFolder}/internal.ts`, internalIndexFile);

        // Generate Freon configuration if it isn't there
        const combinedPath = getCombinedFolderPath(this.outputFolder, this.customsFolder);
        let filePath: string = `${this.outputFolder}${this.customsFolder}/${Names.configuration}.ts`
        LOGGER.log(`Generating Freon Configuration: ${filePath}`);
        const configurationFile = FileUtil.pretty(
            configurationTemplate.generate(language, combinedPath),
            "Configuration",
            generationStatus,
        );
        FileUtil.generateManualFile(filePath, configurationFile, "Configuration");

        // Generate index to customs folder if it isn't there
        filePath = `${this.outputFolder}${this.customsFolder}/index.ts`
        LOGGER.log(`Generating Freon Configuration: ${filePath}`);
        const indexFile = FileUtil.pretty(
          configurationTemplate.generateCustomIndex(language),
          "Custom Index",
          generationStatus,
        );
        FileUtil.generateManualFile(filePath, indexFile, "Custom Index" );

        // set relative path to an extra level to get the imports right
        relativePath = "..";

        LOGGER.log(
            `Generating language structure information: ${this.languageFolder}/${Names.language(language)}.ts`,
        );
        const structureFile = FileUtil.pretty(
            languageTemplate.generateLanguage(language, relativePath),
            "Language Structure",
            generationStatus,
        );
        fs.writeFileSync(`${this.languageFolder}/${Names.language(language)}.ts`, structureFile);

        LOGGER.log(`Generating language environment: ${this.configurationFolder}/${Names.environment(language)}.ts`);
        const environmentFile = FileUtil.pretty(
            environmentTemplate.generateEnvironment(language, this.customsFolder, relativePath),
            "Language Environment",
            generationStatus,
        );
        fs.writeFileSync(`${this.configurationFolder}/${Names.environment(language)}.ts`, environmentFile);

        LOGGER.log(`Generating standard library: ${this.stdlibFolder}/${Names.stdlib(language)}.ts`);
        const stdlibFile = FileUtil.pretty(
            stdlibTemplate.generateStdlibClass(language, this.customsFolder, relativePath),
            "Language Standard Library",
            generationStatus,
        );
        fs.writeFileSync(`${this.stdlibFolder}/${Names.stdlib(language)}.ts`, stdlibFile);

        // generate the utility classes
        LOGGER.log(`Generating user model walker: ${this.utilsFolder}/${Names.walker(language)}.ts`);
        const walkerFile = FileUtil.pretty(
            walkerTemplate.generateWalker(language, relativePath),
            "Walker Class",
            generationStatus,
        );
        fs.writeFileSync(`${this.utilsFolder}/${Names.walker(language)}.ts`, walkerFile);

        LOGGER.log(
            `Generating user model worker interface: ${this.utilsFolder}/${Names.workerInterface(language)}.ts`,
        );
        const workerFile = FileUtil.pretty(
            workerTemplate.generateWorkerInterface(language, relativePath),
            "Worker Interface",
            generationStatus,
        );
        fs.writeFileSync(`${this.utilsFolder}/${Names.workerInterface(language)}.ts`, workerFile);

        LOGGER.log(`Generating user model worker: ${this.utilsFolder}/${Names.defaultWorker(language)}.ts`);
        const defaultWorkerFile = FileUtil.pretty(
            defaultWorkerTemplate.generateDefaultWorker(language, relativePath),
            "DefaultWorker Class",
            generationStatus,
        );
        fs.writeFileSync(`${this.utilsFolder}/${Names.defaultWorker(language)}.ts`, defaultWorkerFile);

        LOGGER.log(`Generating list util: ${this.utilsFolder}/${Names.listUtil}.ts`);
        const listFile = FileUtil.pretty(listTemplate.generateListUtil(), "List Util Class", generationStatus);
        fs.writeFileSync(`${this.utilsFolder}/${Names.listUtil}.ts`, listFile);

        LOGGER.log(`Generating utils index: ${this.utilsFolder}/index.ts`);
        const utilIndexFile = FileUtil.pretty(
            languageIndexTemplate.generateUtilsIndex(language),
            "Utils Index",
            generationStatus,
        );
        fs.writeFileSync(`${this.utilsFolder}/index.ts`, utilIndexFile);

        {
            LOGGER.log(`Generating custom stdlib: ${this.outputFolder}${this.customsFolder}/${Names.customStdlib(language)}.ts`);
            const customFile = FileUtil.pretty(
                stdlibTemplate.generateCustomStdlibClass(language),
                "Custom Stdlib Class",
                generationStatus,
            );
            FileUtil.generateManualFile(
                `${this.outputFolder}${this.customsFolder}/${Names.customStdlib(language)}.ts`,
                customFile,
                "Custom Stdlib Class",
            );
        }
        {
            LOGGER.log(`Generating stdlib index: ${this.stdlibFolder}/index.ts`);
            const indexFile = FileUtil.pretty(
                stdlibTemplate.generateIndex(),
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

        const filePath2 = `${this.outputFolder}${this.customsFolder}/FreonCommandLineRunner.ts`
        LOGGER.log(`Generating command line runner: ${filePath2}`);
        const commandLineRunnerFile = FileUtil.pretty(
            commandLineTemplate.generateCommandLineRunner(language, getCombinedFolderPath(this.outputFolder, this.customsFolder)),
            "CommandLineRunner Class",
            generationStatus,
        );
        FileUtil.generateManualFile(
            `${filePath2}`,
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
        fs.writeFileSync(`${this.outputFolder}/index.ts`, rootIndexFile);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.info(`Generated language '${language.name}' with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Successfully generated language '${language.name}'`);
        }
    }

    private getFolderNames() {
        this.languageFolder = this.outputFolder + "/" + LANGUAGE_FOLDER;
        this.utilsFolder = this.outputFolder + "/" + LANGUAGE_UTILS_FOLDER;
        this.configurationFolder = this.outputFolder + "/" + CONFIGURATION_FOLDER;
        this.stdlibFolder = this.outputFolder + "/" + STDLIB_FOLDER;
        this.commandlineFolder = this.outputFolder + "/" + COMMAND_LINE_FOLDER;
        
        this.configurationFolder = this.outputFolder + "/" + CONFIGURATION_FOLDER;
        this.stdlibFolder = this.outputFolder + "/" + STDLIB_FOLDER;
        this.commandlineFolder = this.outputFolder + "/" + COMMAND_LINE_FOLDER;
    }
}
