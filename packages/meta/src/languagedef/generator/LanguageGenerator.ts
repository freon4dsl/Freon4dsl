import { Helpers } from "../../utils/Helpers";
import { IndexTemplate } from "./templates/IndexTemplate";
import { AllConceptsTemplate } from "./templates/AllConceptsTemplate";
import { Names } from "../../utils/Names";
import { EnumerationTemplate } from "./templates/EnumerationTemplate";
import { UnionTemplate } from "./templates/UnionTemplate";
import { MetaTypeTemplate } from "./templates/MetaTypeTemplate";
import { PiLanguageUnit } from "../metalanguage/PiLanguage";
import { ConceptTemplate } from "./templates/ConceptTemplate";
import * as fs from "fs";
import { LANGUAGE_FOLDER, LANGUAGE_UTILS_FOLDER } from "../../utils/GeneratorConstants";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { WalkerTemplate } from "./templates/WalkerTemplate";
import { WorkerInterfaceTemplate } from "./templates/WorkerInterfaceTemplate";
import { UnparserTemplate } from "./templates/UnparserTemplate";
import { ModelCreatorTemplate } from "./conveniences/ModelCreatorTemplate";

const LOGGER = new PiLogger("LanguageGenerator"); // .mute();
export class LanguageGenerator {
    public outputfolder: string = ".";
    protected languageFolder: string;
    utilsFolder: string;

    constructor() {    }

    generate(language: PiLanguageUnit, verbose?: boolean): void {
        if (verbose) LOGGER.log("Generating language '" + language.name + "' in folder " + this.outputfolder + "/" + LANGUAGE_FOLDER);
        this.languageFolder = this.outputfolder + "/" + LANGUAGE_FOLDER;
        this.utilsFolder = this.outputfolder + "/" + LANGUAGE_UTILS_FOLDER;

        const conceptTemplate = new ConceptTemplate();
        const languageTemplate = new MetaTypeTemplate();
        const enumerationTemplate = new EnumerationTemplate();
        const typeTemplate = new UnionTemplate();
        const languageIndexTemplate = new IndexTemplate();
        const allConceptsTemplate = new AllConceptsTemplate();
        const walkerTemplate = new WalkerTemplate();
        const workerTemplate = new WorkerInterfaceTemplate();
        const unparserTemplate = new UnparserTemplate();
        const modelcreatorTemplate = new ModelCreatorTemplate();

        //Prepare folders
        Helpers.createDirIfNotExisting(this.languageFolder);
        Helpers.createDirIfNotExisting(this.utilsFolder);

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
        if (verbose) LOGGER.log("Generating metatype info: " + language.name + ".ts");
        var languageFile = Helpers.pretty(languageTemplate.generateMetaType(language), "Model info");
        fs.writeFileSync(`${this.languageFolder}/${Names.metaType(language)}.ts`, languageFile);

        if (verbose) LOGGER.log("Generating " + Names.allConcepts(language) + " class: " + Names.allConcepts(language) + ".ts");
        var allConceptsFile = Helpers.pretty(allConceptsTemplate.generateAllConceptsClass(language), "All Concepts Class");
        fs.writeFileSync(`${this.languageFolder}/${Names.allConcepts(language)}.ts`, allConceptsFile);

        if (verbose) LOGGER.log("Generating language index: index.ts");
        var languageIndexFile = Helpers.pretty(languageIndexTemplate.generateIndex(language), "Language Index");
        fs.writeFileSync(`${this.languageFolder}/index.ts`, languageIndexFile);

        // set relative path to an extra level to get the imports right
        relativePath = "../../";

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
