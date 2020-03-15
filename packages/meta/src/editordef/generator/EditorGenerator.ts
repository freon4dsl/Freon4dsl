import { PiLanguageEditor } from "../metalanguage/PiLanguageEditor";
import { Helpers } from "../../utils/Helpers";
import { ContextTemplate } from "./templates/ContextTemplate";
import { UserTemplate } from "../../languagedef/generator/templates/UserTemplate";
import { EditorTemplate } from "./templates/EditorTemplate";
import { EditorIndexTemplate } from "./templates/EditorIndexTemplate";
import { Names } from "../../utils/Names";
import { EnumerationSelectBoxTemplate } from "./templates/EnumerationSelectBoxTemplate";
import { MainProjectionalEditorTemplate } from "./templates/MainProjectionalEditorTemplate";
import { ProjectionTemplate } from "./templates/ProjectionTemplate";
import { ActionsTemplate } from "./templates/ActionsTemplate";
import { PiLanguage } from "../../languagedef/metalanguage/PiLanguage";
import * as fs from "fs";
import { EDITOR_GEN_FOLDER, EDITOR_FOLDER } from "../../utils/GeneratorConstants";

export class EditorGenerator {
    public outputfolder: string = ".";
    protected editorGenFolder: string;
    protected editorFolder: string;
    language: PiLanguage;

    protected userTemplate = new UserTemplate();

    constructor() {    }

    generate(editor: PiLanguageEditor): void {
        console.log("start editor generator")
        const actions = new ActionsTemplate();
        const projection = new ProjectionTemplate();
        const enumProjection = new EnumerationSelectBoxTemplate();
        const contextTemplate = new ContextTemplate();
        const projectionalEditorTemplate = new MainProjectionalEditorTemplate();
        const editorTemplate = new EditorTemplate();
        const editorIndexTemplate = new EditorIndexTemplate();

        //Prepare folders
        this.editorFolder = this.outputfolder + "/" + EDITOR_FOLDER;
        this.editorGenFolder = this.outputfolder + "/" + EDITOR_GEN_FOLDER;
        Helpers.createDirIfNotExisting(this.editorFolder);
        Helpers.createDirIfNotExisting(this.editorGenFolder);

        //  Generate it
        var projectionfileDefault = Helpers.pretty(projection.generateProjectionDefault(this.language), "Projection Default");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.projectionDefault(this.language)}.ts`, projectionfileDefault);

        var enumProjectionFile = Helpers.pretty(enumProjection.generate(this.language), "Enumeration Projections");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.enumProjections(this.language)}.ts`, enumProjectionFile);

        var defaultActionsFile = Helpers.pretty(actions.generateDefaultActions(this.language), "DefaultActions");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.defaultActions(this.language)}.ts`, defaultActionsFile);

        var manualActionsFile = Helpers.pretty(actions.generateManualActions(this.language), "ManualActions");
        Helpers.generateManualFile(`${this.editorFolder}/${Names.manualActions(this.language)}.ts`, manualActionsFile, "ManualActions");

        var actionsFile = Helpers.pretty(actions.generateActions(this.language), "Actions");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.actions(this.language)}.ts`, actionsFile);

        var contextFile = Helpers.pretty(contextTemplate.generateContext(this.language), "Context");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.context(this.language)}.ts`, contextFile);

        var projectionalEditorFile = Helpers.pretty(projectionalEditorTemplate.generateEditor(this.language, true), "MainProjectionalEditor");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.mainProjectionalEditor(this.language)}.tsx`, projectionalEditorFile);

        var projectionalEditorManualFile = Helpers.pretty(projection.generateProjection(this.language), "ProjectionalEditorManual");
        Helpers.generateManualFile(`${this.editorFolder}/${Names.projection(this.language)}.ts`, projectionalEditorManualFile, "ManualProjections");

        var editorFile = Helpers.pretty(editorTemplate.generateEditor(this.language, true), "Editor");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.editor(this.language)}.ts`, editorFile);
        var editorIndexGenFile = Helpers.pretty(editorIndexTemplate.generateGenIndex(this.language), "Editor Gen Index");
        fs.writeFileSync(`${this.editorGenFolder}/index.ts`, editorIndexGenFile);

        var editorIndexFile = Helpers.pretty(editorIndexTemplate.generateIndex(this.language), "Editor Index");
        fs.writeFileSync(`${this.editorFolder}/index.ts`, editorIndexFile);
    }

}
