import { Names } from "./templates/Names";
import { MainProjectionalEditorTemplate } from "./templates/MainProjectionalEditorTemplate";
import { ContextTemplate } from "./templates/ContextTemplate";
import { EnumerationTemplate } from "./templates/EnumerationTemplate";
import { LanguageTemplates } from "./templates/LanguageTemplate";
import { WithTypeTemplate } from "./templates/WithTypeTemplate";
import { ProjectionTemplate } from "./templates/ProjectionTemplate";
import { PiLanguageChecker } from "./PiLanguageChecker";
import { ActionsTemplate } from "./templates/ActionsTemplate";
import { PiLanguage } from "./PiLanguage";
import { ConceptTemplate } from "./templates/ConceptTemplate";
import { PiLanguageDef } from "./PiLanguageDef";
import * as fs from "fs";
import parserTypeScript = require("prettier/parser-typescript");

const prettier = require("prettier/standalone");

const LANGUAGE_FOLDER = "language";
const EDITOR_FOLDER = "editor";

export class LanguageGenerator {
    outputfolder: string;

    constructor(output: string) {
        this.outputfolder == output;
    }

    generate(model: PiLanguageDef): void {
        const language = new PiLanguage(model);

        const checker = new PiLanguageChecker();
        checker.checkLanguage(language);
        checker.errors.forEach(error => console.log("ERROR: " + error));

        const templates: ConceptTemplate = new ConceptTemplate();
        const actions: ActionsTemplate = new ActionsTemplate();
        const projection: ProjectionTemplate  = new ProjectionTemplate();
        const withTypeTemplate: WithTypeTemplate  = new WithTypeTemplate();
        const languageTemplate: LanguageTemplates  = new LanguageTemplates();
        const enumerationTemplate: EnumerationTemplate  = new EnumerationTemplate();
        const contextTemplate: ContextTemplate  = new ContextTemplate();
        const projctionalEditorTemplate: MainProjectionalEditorTemplate  = new MainProjectionalEditorTemplate();

        language.concepts.forEach(concept => {
            var generated = this.pretty(templates.generateConcept(concept), "concept "+ concept.name);
            fs.writeFileSync(`${LANGUAGE_FOLDER}/${Names.concept(concept)}.ts`, generated);
        });

        language.enumerations.forEach(enumeration => {
            var generated = this.pretty(enumerationTemplate.generateEnumeration(enumeration), "Enumeration "+ enumeration.name);
            fs.writeFileSync(`${LANGUAGE_FOLDER}/${Names.enumeration(enumeration)}.ts`, generated);
        });

        var languageFile = this.pretty(languageTemplate.generateLanguage(model, language), "Model info");
        fs.writeFileSync(`${LANGUAGE_FOLDER}/${language.name}.ts`, languageFile);

        var withTypeFile = this.pretty(withTypeTemplate.generateTypeInterface(language), "Id Interface");
        fs.writeFileSync(`${LANGUAGE_FOLDER}/WithType.ts`, withTypeFile);

        var projectionfile = this.pretty(projection.generateProjection(language), "Projection");
        fs.writeFileSync(`${EDITOR_FOLDER}/${Names.projection(language)}.ts`, projectionfile);

        var actionsFile = this.pretty(actions.generateActions(language), "Actions");
        fs.writeFileSync(`${EDITOR_FOLDER}/${Names.actions(language)}.ts`, actionsFile);

        var contextFile = this.pretty(contextTemplate.generateContext(language), "Context");
        fs.writeFileSync(`${EDITOR_FOLDER}/${Names.context(language)}.ts`, contextFile);

        var projectionalEditorFile = this.pretty(projctionalEditorTemplate.generateEditor(language), "MainProjectionalEditor");
        fs.writeFileSync(`${EDITOR_FOLDER}/${Names.mainProjectionalEditor(language)}.tsx`, projectionalEditorFile);
    }

    pretty(typescriptFile: string, message: string): string {
        try {
            return prettier.format(typescriptFile, {
                parser: "typescript",
                printWidth: 140,
                tabWidth: 4,
                plugins: [parserTypeScript]
            });
        } catch (e) {
            console.log("Syntax error: " + message);
            console.log(e.message);
        }
        return typescriptFile;
    }

}
