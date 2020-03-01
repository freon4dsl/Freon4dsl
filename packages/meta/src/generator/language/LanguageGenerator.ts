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

        console.log("Generating Pi interface: WithType.ts");
        var withTypeFile = Helpers.pretty(withTypeTemplate.generateTypeInterface(language), "Id Interface");
        fs.writeFileSync(`${this.languageFolder}/WithType.ts`, withTypeFile);

        console.log("Generating language index: index.ts");
        var languageIndexFile = Helpers.pretty(languageIndexTemplate.generateIndex(language), "Language Index");
        fs.writeFileSync(`${this.languageFolder}/index.ts`, languageIndexFile);
    
        console.log("Generating All" + language.name + "Concepts class: All" + language.name + "Concepts.ts");
        var allConceptsFile = Helpers.pretty(allConceptsTemplate.generateAllConceptsClass(language), "All" + language.name + "Concepts Class");
        fs.writeFileSync(`${this.languageFolder}/All${language.name}Concepts.ts`, allConceptsFile);
    }
}
