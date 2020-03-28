import { EnvironmentTemplate } from "./templates/EnvironmentTemplate";
import { PiReferenceTemplate } from "./templates/PiReferenceTemplate";
import { Helpers } from "../../utils/Helpers";
import { LanguageIndexTemplate } from "./templates/LanguageIndexTemplate";
import { AllConceptsTemplate } from "./templates/AllConceptsTemplate";
import { Names } from "../../utils/Names";
import { EnumerationTemplate } from "./templates/EnumerationTemplate";
import { UnionTemplate } from "./templates/UnionTemplate";
import { LanguageTemplates } from "./templates/LanguageTemplate";
import { PiLanguageUnit } from "../metalanguage/PiLanguage";
import { ConceptTemplate } from "./templates/ConceptTemplate";
import * as fs from "fs";
import { ENVIRONMENT_FOLDER, LANGUAGE_FOLDER, LANGUAGE_UTILS_FOLDER } from "../../utils/GeneratorConstants";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { WalkerTemplate } from "./templates/WalkerTemplate";
import { WorkerInterfaceTemplate } from "./templates/WorkerInterfaceTemplate";
import { UnparserTemplate } from "./templates/UnparserTemplate";

const LOGGER = new PiLogger("LanguageGenerator"); // .mute();
export class LanguageGenerator {
    public outputfolder: string = ".";
    protected languageFolder: string;
    protected environmentFolder: string;
    utilsFolder: string;

    constructor() {    }

    generate(language: PiLanguageUnit, verbose?: boolean): void {
        if (verbose) LOGGER.log("Generating language '" + language.name + "' in folder " + this.outputfolder + "/" + LANGUAGE_FOLDER);

        const conceptTemplate = new ConceptTemplate();
        const languageTemplate = new LanguageTemplates();
        const enumerationTemplate = new EnumerationTemplate();
        const typeTemplate = new UnionTemplate();
        const languageIndexTemplate = new LanguageIndexTemplate();
        const allConceptsTemplate = new AllConceptsTemplate();
        const piReferenceTemplate = new PiReferenceTemplate();
        const environmentTemplate = new EnvironmentTemplate();
        const walkerTemplate = new WalkerTemplate();
        const workerTemplate = new WorkerInterfaceTemplate();
        const unparserTemplate = new UnparserTemplate();

        this.languageFolder = this.outputfolder + "/" + LANGUAGE_FOLDER;
        this.utilsFolder = this.outputfolder + "/" + LANGUAGE_UTILS_FOLDER;
        Helpers.createDirIfNotExisting(this.languageFolder);
        Helpers.createDirIfNotExisting(this.utilsFolder);

        this.environmentFolder = this.outputfolder + "/" + ENVIRONMENT_FOLDER;
        Helpers.createDirIfNotExisting(this.environmentFolder);

        language.classes.forEach(concept => {
            if (verbose) LOGGER.log("Generating concept: " + concept.name);
            var generated = Helpers.pretty(conceptTemplate.generateConcept(concept), "concept " + concept.name);
            fs.writeFileSync(`${this.languageFolder}/${Names.concept(concept)}.ts`, generated);
        });

        language.enumerations.forEach(enumeration => {
            if (verbose) LOGGER.log("Generating enumeration: " + enumeration.name);
            var generated = Helpers.pretty(enumerationTemplate.generateEnumeration(enumeration), "enumeration " + enumeration.name);
            fs.writeFileSync(`${this.languageFolder}/${Names.enumeration(enumeration)}.ts`, generated);
        });

        language.unions.forEach(union => {
            if (verbose) LOGGER.log("Generating union: " + union.name);
            var generated = Helpers.pretty(typeTemplate.generateUnion(union), "union " + union.name);
            fs.writeFileSync(`${this.languageFolder}/${Names.type(union)}.ts`, generated);
        });

        // TODO generate language.interfaces

        if (verbose) LOGGER.log("Generating PeElementReference.ts");
        var referenceFile = Helpers.pretty(piReferenceTemplate.generatePiReference(language), "PiElementReference");
        fs.writeFileSync(`${this.languageFolder}/PiElementReference.ts`, referenceFile);

        if (verbose) LOGGER.log("Generating metatype info: " + language.name + ".ts");
        var languageFile = Helpers.pretty(languageTemplate.generateLanguage(language), "Model info");
        fs.writeFileSync(`${this.languageFolder}/${language.name}.ts`, languageFile);

        if (verbose) LOGGER.log("Generating " + Names.allConcepts(language) + " class: " + Names.allConcepts(language) + ".ts");
        var allConceptsFile = Helpers.pretty(allConceptsTemplate.generateAllConceptsClass(language), "All Concepts Class");
        fs.writeFileSync(`${this.languageFolder}/${Names.allConcepts(language)}.ts`, allConceptsFile);

        if (verbose) LOGGER.log("Generating language index: index.ts");
        var languageIndexFile = Helpers.pretty(languageIndexTemplate.generateIndex(language), "Language Index");
        fs.writeFileSync(`${this.languageFolder}/index.ts`, languageIndexFile);

        // Environment
        if (verbose) LOGGER.log("Generating environment");
        var environmentFile = Helpers.pretty(environmentTemplate.generateEnvironment(language), "Language Environment");
        fs.writeFileSync(`${this.environmentFolder}/${Names.environment(language)}.ts`, environmentFile);

        // generate the utility classes
        if (verbose) LOGGER.log("Generating language walker: " + Names.walker(language) + ".ts");
        var walkerFile = Helpers.pretty(walkerTemplate.generateWalker(language), "Walker Class");
        fs.writeFileSync(`${this.utilsFolder}/${Names.walker(language)}.ts`, walkerFile);

        if (verbose) LOGGER.log("Generating language worker: " + Names.workerInterface(language) + ".ts");
        var workerFile = Helpers.pretty(workerTemplate.generateWorkerInterface(language), "WorkerInterface Class");
        fs.writeFileSync(`${this.utilsFolder}/${Names.workerInterface(language)}.ts`, workerFile);

        if (verbose) LOGGER.log("Generating language unparser: " + Names.unparser(language) + ".ts");
        var unparserFile = Helpers.pretty(unparserTemplate.generateUnparser(language), "Unparser Class");
        fs.writeFileSync(`${this.utilsFolder}/${Names.unparser(language)}.ts`, unparserFile);

        if (verbose) LOGGER.log("Succesfully generated language '" + language.name + "'"); // TODO check if it is really succesfull
    }
}
