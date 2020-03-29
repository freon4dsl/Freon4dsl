import * as fs from "fs";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { ModelCreatorTemplate } from "./conveniences/ModelCreatorTemplate";
import { ENVIRONMENT_FOLDER, Helpers, LANGUAGE_FOLDER, LANGUAGE_UTILS_FOLDER, Names } from "../../utils";
import { PiLanguageUnit } from "../metalanguage/PiLanguage";
import {
    AllConceptsTemplate,
    ConceptTemplate,
    EnumerationTemplate,
    EnvironmentTemplate,
    IndexTemplate,
    MetaTypeTemplate,
    PiReferenceTemplate,
    UnionTemplate,
    UnparserTemplate,
    WalkerTemplate,
    WorkerInterfaceTemplate
} from "./templates";

const LOGGER = new PiLogger("LanguageGenerator"); // .mute();
export class LanguageGenerator {
    public outputfolder: string = ".";
    protected languageFolder: string;
    protected environmentFolder: string;
    utilsFolder: string;

    constructor() {}

    generate(language: PiLanguageUnit, verbose?: boolean): void {
        if (verbose) LOGGER.log("Generating language '" + language.name + "' in folder " + this.outputfolder + "/" + LANGUAGE_FOLDER);
        this.languageFolder = this.outputfolder + "/" + LANGUAGE_FOLDER;
        this.utilsFolder = this.outputfolder + "/" + LANGUAGE_UTILS_FOLDER;
        this.environmentFolder = this.outputfolder + "/" + ENVIRONMENT_FOLDER;

        const conceptTemplate = new ConceptTemplate();
        const metaTypeTemplate = new MetaTypeTemplate();
        const enumerationTemplate = new EnumerationTemplate();
        const typeTemplate = new UnionTemplate();
        const languageIndexTemplate = new IndexTemplate();
        const allConceptsTemplate = new AllConceptsTemplate();
        const piReferenceTemplate = new PiReferenceTemplate();
        const environmentTemplate = new EnvironmentTemplate();
        const walkerTemplate = new WalkerTemplate();
        const workerTemplate = new WorkerInterfaceTemplate();
        const unparserTemplate = new UnparserTemplate();
        const modelcreatorTemplate = new ModelCreatorTemplate();

        //Prepare folders
        Helpers.createDirIfNotExisting(this.languageFolder);
        Helpers.createDirIfNotExisting(this.utilsFolder);
        Helpers.createDirIfNotExisting(this.environmentFolder);

        // set relative path to get the imports right
        let relativePath = "../";

        //  Generate it
        language.classes.forEach(concept => {
            if (verbose) LOGGER.log("Generating concept: " + concept.name);
            var generated = Helpers.pretty(conceptTemplate.generateConcept(concept, relativePath), "concept " + concept.name);
            fs.writeFileSync(`${this.languageFolder}/${Names.concept(concept)}.ts`, generated);
        });

        language.enumerations.forEach(enumeration => {
            if (verbose) LOGGER.log("Generating enumeration: " + enumeration.name);
            var generated = Helpers.pretty(enumerationTemplate.generateEnumeration(enumeration, relativePath), "enumeration " + enumeration.name);
            fs.writeFileSync(`${this.languageFolder}/${Names.enumeration(enumeration)}.ts`, generated);
        });

        language.unions.forEach(union => {
            if (verbose) LOGGER.log("Generating union: " + union.name);
            var generated = Helpers.pretty(typeTemplate.generateUnion(union, relativePath), "union " + union.name);
            fs.writeFileSync(`${this.languageFolder}/${Names.union(union)}.ts`, generated);
        });

        // TODO generate language.interfaces

        // the following classes do not need the relative path for their imports
        if (verbose) LOGGER.log("Generating PeElementReference.ts");
        var referenceFile = Helpers.pretty(piReferenceTemplate.generatePiReference(language), "PiElementReference");
        fs.writeFileSync(`${this.languageFolder}/PiElementReference.ts`, referenceFile);

        if (verbose) LOGGER.log("Generating metatype info: " + language.name + ".ts");
        var languageFile = Helpers.pretty(metaTypeTemplate.generateMetaType(language), "Model info");
        fs.writeFileSync(`${this.languageFolder}/${Names.metaType(language)}.ts`, languageFile);

        if (verbose) LOGGER.log("Generating " + Names.allConcepts(language) + " class: " + Names.allConcepts(language) + ".ts");
        var allConceptsFile = Helpers.pretty(allConceptsTemplate.generateAllConceptsClass(language), "All Concepts Class");
        fs.writeFileSync(`${this.languageFolder}/${Names.allConcepts(language)}.ts`, allConceptsFile);

        if (verbose) LOGGER.log("Generating language index: index.ts");
        var languageIndexFile = Helpers.pretty(languageIndexTemplate.generateIndex(language), "Language Index");
        fs.writeFileSync(`${this.languageFolder}/index.ts`, languageIndexFile);

        // set relative path to an extra level to get the imports right
        relativePath = "../../";
        // Environment
        if (verbose) LOGGER.log("Generating environment");
        var environmentFile = Helpers.pretty(environmentTemplate.generateEnvironment(language), "Language Environment");
        fs.writeFileSync(`${this.environmentFolder}/${Names.environment(language)}.ts`, environmentFile);

        // generate the utility classes
        if (verbose) LOGGER.log("Generating language walker: " + Names.walker(language) + ".ts");
        var walkerFile = Helpers.pretty(walkerTemplate.generateWalker(language, relativePath), "Walker Class");
        fs.writeFileSync(`${this.utilsFolder}/${Names.walker(language)}.ts`, walkerFile);

        if (verbose) LOGGER.log("Generating language worker: " + Names.workerInterface(language) + ".ts");
        var workerFile = Helpers.pretty(workerTemplate.generateWorkerInterface(language, relativePath), "WorkerInterface Class");
        fs.writeFileSync(`${this.utilsFolder}/${Names.workerInterface(language)}.ts`, workerFile);

        if (verbose) LOGGER.log("Generating language unparser: " + Names.unparser(language) + ".ts");
        var unparserFile = Helpers.pretty(unparserTemplate.generateUnparser(language, relativePath), "Unparser Class");
        fs.writeFileSync(`${this.utilsFolder}/${Names.unparser(language)}.ts`, unparserFile);

        // generate the convenience classes
        if (verbose) LOGGER.log(`Generating language model creator: ${language.name}Creator.ts`);
        var creatorFile = Helpers.pretty(modelcreatorTemplate.generateModelCreator(language), "Model Creator Class");
        fs.writeFileSync(`${this.utilsFolder}/${language.name}Creator.ts`, creatorFile);

        if (verbose) LOGGER.log("Succesfully generated language '" + language.name + "'"); // TODO check if it is really succesfull
    }
}
