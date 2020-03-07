import { Helpers } from "../Helpers";
import { LanguageIndexTemplate } from "./templates/LanguageIndexTemplate";
import { AllConceptsTemplate } from "./templates/AllConceptsTemplate";
import { Names } from "../Names";
import { EnumerationTemplate } from "./templates/EnumerationTemplate";
import { TypeTemplate } from "./templates/TypeTemplate";
import { LanguageTemplates } from "./templates/LanguageTemplate";
import { WithTypeTemplate } from "./templates/WithTypeTemplate";
import { PiLanguage } from "../../metalanguage/PiLanguage";
import { ConceptTemplate } from "./templates/ConceptTemplate";
import * as fs from "fs";
import { LANGUAGE_FOLDER } from "../GeneratorConstants";
import { ScoperInterfaceTemplate } from "./templates/ScoperInterfaceTemplate";
import { TyperInterfaceTemplate } from "./templates/TyperInterfaceTemplate";
import { ValidatorInterfaceTemplate } from "./templates/ValidatorInterfaceTemplate";

export class LanguageGenerator {
    public outputfolder: string = ".";
    protected languageFolder: string;

    constructor() {    }

    generate(language: PiLanguage): void {
        console.log("start generator")
        const templates = new ConceptTemplate();
        const withTypeTemplate = new WithTypeTemplate();
        const languageTemplate = new LanguageTemplates();
        const enumerationTemplate = new EnumerationTemplate();
        const typeTemplate = new TypeTemplate();
        const languageIndexTemplate = new LanguageIndexTemplate();
        const allConceptsTemplate = new AllConceptsTemplate();
        const scoperTemplate = new ScoperInterfaceTemplate();
        const typerTemplate = new TyperInterfaceTemplate();
        const validatorTemplate = new ValidatorInterfaceTemplate();

        this.languageFolder = this.outputfolder + "/" + LANGUAGE_FOLDER;
        Helpers.createDirIfNotExisting(this.languageFolder);

        console.log("Generating language: "+ language?.name);
        language.concepts.forEach(concept => {
            console.log("Generating concept: " + concept.name);
            var generated = Helpers.pretty(templates.generateConcept(concept), "concept " + concept.name);
            fs.writeFileSync(`${this.languageFolder}/${Names.concept(concept)}.ts`, generated);
        });

        language.enumerations.forEach(enumeration => {
            console.log("Generating enumeration: " + enumeration.name);
            var generated = Helpers.pretty(enumerationTemplate.generateEnumeration(enumeration), "Enumeration " + enumeration.name);
            fs.writeFileSync(`${this.languageFolder}/${Names.enumeration(enumeration)}.ts`, generated);
        });

        language.types.forEach(type => {
            console.log("Generating type: " + type.name);
            var generated = Helpers.pretty(typeTemplate.generateType(type), "type " + type.name);
            fs.writeFileSync(`${this.languageFolder}/${Names.type(type)}.ts`, generated);
        });

        console.log("Generating metatype info: " + language.name + ".ts");
        var languageFile = Helpers.pretty(languageTemplate.generateLanguage(language), "Model info");
        fs.writeFileSync(`${this.languageFolder}/${language.name}.ts`, languageFile);

        console.log("Generating " + Names.allConcepts(language) + " class: " + Names.allConcepts(language) + ".ts");
        var allConceptsFile = Helpers.pretty(allConceptsTemplate.generateAllConceptsClass(language), "All Concepts Class");
        fs.writeFileSync(`${this.languageFolder}/${Names.allConcepts(language)}.ts`, allConceptsFile);

        console.log("Generating language index: index.ts");
        var languageIndexFile = Helpers.pretty(languageIndexTemplate.generateIndex(language), "Language Index");
        fs.writeFileSync(`${this.languageFolder}/index.ts`, languageIndexFile);
    
        console.log("Generating (Filer) Pi interface: " + Names.withTypeInterface(language) + ".ts");
        var withTypeFile = Helpers.pretty(withTypeTemplate.generateTypeInterface(language), "Id Interface");
        fs.writeFileSync(`${this.languageFolder}/${Names.withTypeInterface(language)}.ts`, withTypeFile);

        console.log("Generating Scoper interface: " + Names.scoperInterface(language) + ".ts");
        var scoperFile = Helpers.pretty(scoperTemplate.generateScoperInterface(language), "Scoper Interface");
        fs.writeFileSync(`${this.languageFolder}/${Names.scoperInterface(language)}.ts`, scoperFile);

        console.log("Generating Typer interface: " + Names.typerInterface(language) + ".ts");
        var typerFile = Helpers.pretty(typerTemplate.generateTyperInterface(language), "Typer Interface");
        fs.writeFileSync(`${this.languageFolder}/${Names.typerInterface(language)}.ts`, typerFile);

        console.log("Generating Validator interface: " + Names.validatorInterface(language) + ".ts");
        var typerFile = Helpers.pretty(validatorTemplate.generateValidatorInterface(language), "Validator Interface");
        fs.writeFileSync(`${this.languageFolder}/${Names.validatorInterface(language)}.ts`, typerFile);
    }
}
