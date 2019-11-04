import { EditorIndexTemplate } from "./templates/EditorIndexTemplate";
import { LanguageIndexTemplate } from "./templates/LanguageIndexTemplate";
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
        this.outputfolder = output;
    }

    generate(model: PiLanguageDef): void {
        const language = new PiLanguage(model);

        const checker = new PiLanguageChecker();
        checker.checkLanguage(language);
        checker.errors.forEach(error => console.log("ERROR: " + error));

        const templates = new ConceptTemplate();
        const actions = new ActionsTemplate();
        const projection = new ProjectionTemplate();
        const withTypeTemplate = new WithTypeTemplate();
        const languageTemplate = new LanguageTemplates();
        const enumerationTemplate = new EnumerationTemplate();
        const contextTemplate = new ContextTemplate();
        const projectionalEditorTemplate = new MainProjectionalEditorTemplate();
        const languageIndexTemplate = new LanguageIndexTemplate();
        const editorIndexTemplate = new EditorIndexTemplate();

        language.concepts.forEach(concept => {
            var generated = this.pretty(templates.generateConcept(concept), "concept " + concept.name);
            fs.writeFileSync(`${LANGUAGE_FOLDER}/${Names.concept(concept)}.ts`, generated);
        });

        language.enumerations.forEach(enumeration => {
            var generated = this.pretty(enumerationTemplate.generateEnumeration(enumeration), "Enumeration " + enumeration.name);
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

        var projectionalEditorFile = this.pretty(projectionalEditorTemplate.generateEditor(language), "MainProjectionalEditor");
        fs.writeFileSync(`${EDITOR_FOLDER}/${Names.mainProjectionalEditor(language)}.tsx`, projectionalEditorFile);

        var languageIndexFile = this.pretty(languageIndexTemplate.generateIndex(language), "Language Index");
        fs.writeFileSync(`${LANGUAGE_FOLDER}/index.ts`, languageIndexFile);
        var editorIndexFile = this.pretty(editorIndexTemplate.generateIndex(language), "Editor Index");
        fs.writeFileSync(`${EDITOR_FOLDER}/index.ts`, editorIndexFile);
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
