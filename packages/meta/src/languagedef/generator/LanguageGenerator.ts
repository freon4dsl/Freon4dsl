import * as fs from "fs";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { ModelCreatorTemplate } from "./conveniences/ModelCreatorTemplate";
import {
    CONFIGURATION_FOLDER,
    ENVIRONMENT_GEN_FOLDER,
    GenerationStatus,
    Helpers,
    LANGUAGE_GEN_FOLDER,
    LANGUAGE_UTILS_GEN_FOLDER,
    Names,
    STDLIB_GEN_FOLDER
} from "../../utils";
import { PiLanguageUnit } from "../metalanguage/PiLanguage";
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
    InterfaceTemplate,
    StdlibTemplate
} from "./templates";
import { ConfigurationTemplate } from "./templates/ConfigurationTemplate";

const LOGGER = new PiLogger("LanguageGenerator"); //.mute();
export class LanguageGenerator {
    public outputfolder: string = ".";
    protected languageGenFolder: string;
    protected environmentGenFolder: string;
    protected utilsGenFolder: string;
    protected stdlibGenFolder: string;
    protected configurationFolder: string;

    constructor() {}

    generate(language: PiLanguageUnit): void {
        LOGGER.log("Generating language '" + language.name + "' in folder " + this.outputfolder + "/" + LANGUAGE_GEN_FOLDER);
        let generationStatus = new GenerationStatus();
        this.languageGenFolder = this.outputfolder + "/" + LANGUAGE_GEN_FOLDER;
        this.utilsGenFolder = this.outputfolder + "/" + LANGUAGE_UTILS_GEN_FOLDER;
        this.environmentGenFolder = this.outputfolder + "/" + ENVIRONMENT_GEN_FOLDER;
        this.stdlibGenFolder = this.outputfolder + "/" + STDLIB_GEN_FOLDER;
        this.configurationFolder = this.outputfolder + "/" + CONFIGURATION_FOLDER;

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
        const modelcreatorTemplate = new ModelCreatorTemplate();
        const configurationTemplate = new ConfigurationTemplate();

        //Prepare folders
        Helpers.createDirIfNotExisting(this.languageGenFolder);
        Helpers.createDirIfNotExisting(this.utilsGenFolder);
        Helpers.createDirIfNotExisting(this.environmentGenFolder);
        Helpers.createDirIfNotExisting(this.configurationFolder);
        Helpers.createDirIfNotExisting(this.stdlibGenFolder);
        Helpers.deleteFilesInDir(this.languageGenFolder, generationStatus);
        Helpers.deleteFilesInDir(this.utilsGenFolder, generationStatus);
        Helpers.deleteFilesInDir(this.environmentGenFolder, generationStatus);
        Helpers.deleteFilesInDir(this.stdlibGenFolder, generationStatus);

        // set relative path to get the imports right
        let relativePath = "../";

        //  Generate it
        language.concepts.forEach(concept => {
            LOGGER.log(`Generating concept: ${this.languageGenFolder}/${Names.concept(concept)}.ts`);
            var generated = Helpers.pretty(conceptTemplate.generateConcept(concept, relativePath), "concept " + concept.name, generationStatus);
            fs.writeFileSync(`${this.languageGenFolder}/${Names.concept(concept)}.ts`, generated);
        });

        language.interfaces.forEach(piInterface => {
            LOGGER.log(`Generating interface: ${this.languageGenFolder}/${Names.interface(piInterface)}.ts`);
            var generated = Helpers.pretty(interfaceTemplate.generateInterface(piInterface, relativePath), "interface " + piInterface.name, generationStatus);
            fs.writeFileSync(`${this.languageGenFolder}/${Names.interface(piInterface)}.ts`, generated);
        });

        // the following classes do not need the relative path for their imports
        LOGGER.log(`Generating metatype info: ${this.languageGenFolder}/${Names.metaType(language)}.ts`);
        var languageFile = Helpers.pretty(metaTypeTemplate.generateMetaType(language), "Model info", generationStatus);
        fs.writeFileSync(`${this.languageGenFolder}/${Names.metaType(language)}.ts`, languageFile);

        LOGGER.log(`Generating metatype class: ${this.languageGenFolder}/${Names.allConcepts(language)}.ts`);
        var allConceptsFile = Helpers.pretty(allConceptsTemplate.generateAllConceptsClass(language), "All Concepts Class", generationStatus);
        fs.writeFileSync(`${this.languageGenFolder}/${Names.allConcepts(language)}.ts`, allConceptsFile);

        LOGGER.log(`Generating language index: ${this.languageGenFolder}/index.ts`);
        var languageIndexFile = Helpers.pretty(languageIndexTemplate.generateIndex(language), "Language Index", generationStatus);
        fs.writeFileSync(`${this.languageGenFolder}/index.ts`, languageIndexFile);

        // Generate projectit configuration if it isn't there
        LOGGER.log(`Generating ProjectIt Configuration: ${this.configurationFolder}/${Names.configuration(language)}.ts`);
        var configurationFile = Helpers.pretty(configurationTemplate.generate(language, relativePath), "Configuration", generationStatus);
        Helpers.generateManualFile(`${this.configurationFolder}/${Names.configuration(language)}.ts`, configurationFile, "Configuration");

        // set relative path to an extra level to get the imports right
        relativePath = "../../";

        LOGGER.log(`Generating PiElementReference: ${this.languageGenFolder}/${Names.PiElementReference}.ts`);
        var referenceFile = Helpers.pretty(piReferenceTemplate.generatePiReference(language, relativePath), "PiElementReference", generationStatus);
        fs.writeFileSync(`${this.languageGenFolder}/${Names.PiElementReference}.ts`, referenceFile);

        LOGGER.log(`Generating language structure information: ${this.languageGenFolder}/${Names.language}.ts`);
        var referenceFile = Helpers.pretty(languageTemplate.generateLanguage(language, relativePath), "Language Structure", generationStatus);
        fs.writeFileSync(`${this.languageGenFolder}/${Names.language(language)}.ts`, referenceFile);

        LOGGER.log(`Generating language environment: ${this.environmentGenFolder}/${Names.environment(language)}.tsx`);
        var environmentFile = Helpers.pretty(environmentTemplate.generateEnvironment(language, relativePath), "Language Environment", generationStatus);
        fs.writeFileSync(`${this.environmentGenFolder}/${Names.environment(language)}.tsx`, environmentFile);

        LOGGER.log(`Generating standard library: ${this.stdlibGenFolder}/${Names.stdlib(language)}.ts`);
        var stdlibFile = Helpers.pretty(stdlibTemplate.generateStdlibClass(language, relativePath), "Language Standard Library", generationStatus);
        fs.writeFileSync(`${this.stdlibGenFolder}/${Names.stdlib(language)}.ts`, stdlibFile);

        // generate the utility classes
        LOGGER.log(`Generating user model walker: ${this.utilsGenFolder}/${Names.walker(language)}.ts`);
        var walkerFile = Helpers.pretty(walkerTemplate.generateWalker(language, relativePath), "Walker Class", generationStatus);
        fs.writeFileSync(`${this.utilsGenFolder}/${Names.walker(language)}.ts`, walkerFile);

        LOGGER.log(`Generating user model worker: ${this.utilsGenFolder}/${Names.workerInterface(language)}.ts`);
        var workerFile = Helpers.pretty(workerTemplate.generateWorkerInterface(language, relativePath), "WorkerInterface Class", generationStatus);
        fs.writeFileSync(`${this.utilsGenFolder}/${Names.workerInterface(language)}.ts`, workerFile);

        // generate the convenience classes
        LOGGER.log(`Generating convenience model creator: ${this.utilsGenFolder}/${language.name}Creator.ts`);
        var creatorFile = Helpers.pretty(modelcreatorTemplate.generateModelCreator(language, relativePath), "Model Creator Class", generationStatus);
        fs.writeFileSync(`${this.utilsGenFolder}/${language.name}Creator.ts`, creatorFile);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.info(this, `Generated language '${language.name}' with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(this, `Succesfully generated language '${language.name}'`);
        }
    }
}
