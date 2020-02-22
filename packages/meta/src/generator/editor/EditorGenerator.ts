import { Helpers } from "../Helpers";
import { UserTemplate } from "../language/templates/UserTemplate";
import { EditorTemplate } from "./templates/EditorTemplate";
import { EditorIndexTemplate } from "./templates/EditorIndexTemplate";
import { Names } from "../Names";
import { MainProjectionalEditorTemplate } from "./templates/MainProjectionalEditorTemplate";
import { ContextTemplate } from "../language/templates/ContextTemplate";
import { ProjectionTemplate } from "./templates/ProjectionTemplate";
import { ActionsTemplate } from "./templates/ActionsTemplate";
import { PiLanguage } from "../../metalanguage/PiLanguage";
import * as fs from "fs";
import { EDITOR_GEN_FOLDER, EDITOR_FOLDER } from "../GeneratorConstants";

export class EditorGenerator {
    public outputfolder: string = ".";
    protected editorGenFolder: string;
    protected editorFolder: string;

    protected userTemplate = new UserTemplate();

    constructor() {    }

    generate(language: PiLanguage): void {
        console.log("start editor generator")
        const actions = new ActionsTemplate();
        const projection = new ProjectionTemplate();
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
        var projectionfileDefault = Helpers.pretty(projection.generateProjectionDefault(language), "Projection Default");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.projectionDefault(language)}.ts`, projectionfileDefault);

        var defaultActionsFile = Helpers.pretty(actions.generateDefaultActions(language), "DefaultActions");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.defaultActions(language)}.ts`, defaultActionsFile);

        var manualActionsFile = Helpers.pretty(actions.generateManualActions(language), "ManualActions");
        Helpers.generateManualFile(`${this.editorFolder}/${Names.manualActions(language)}.ts`, manualActionsFile, "ManualActions");

        var actionsFile = Helpers.pretty(actions.generateActions(language), "Actions");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.actions(language)}.ts`, actionsFile);

        var contextFile = Helpers.pretty(contextTemplate.generateContext(language), "Context");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.context(language)}.ts`, contextFile);

        var projectionalEditorFile = Helpers.pretty(projectionalEditorTemplate.generateEditor(language, true), "MainProjectionalEditor");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.mainProjectionalEditor(language)}.tsx`, projectionalEditorFile);

        var projectionalEditorManualFile = Helpers.pretty(projection.generateProjection(language), "ProjectionalEditorManual");
        Helpers.generateManualFile(`${this.editorFolder}/${Names.projection(language)}.ts`, projectionalEditorManualFile, "ManualProjections");

        var editorFile = Helpers.pretty(editorTemplate.generateEditor(language, true), "Editor");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.editor(language)}.ts`, editorFile);
        var editorIndexGenFile = Helpers.pretty(editorIndexTemplate.generateGenIndex(language), "Editor Gen Index");
        fs.writeFileSync(`${this.editorGenFolder}/index.ts`, editorIndexGenFile);

        var editorIndexFile = Helpers.pretty(editorIndexTemplate.generateIndex(language), "Editor Index");
        fs.writeFileSync(`${this.editorFolder}/index.ts`, editorIndexFile);
    }

}
