import { PiDefEditorLanguage } from "../metalanguage";
import { PiLanguageUnit } from "../../languagedef/metalanguage";
import * as fs from "fs";
import { Names, Helpers, EDITOR_GEN_FOLDER, EDITOR_FOLDER } from "../../utils";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import {
    ActionsTemplate,
    ContextTemplate,
    EditorIndexTemplate,
    EditorTemplate,
    MainProjectionalEditorTemplate,
    ProjectionTemplate,
    SelectionHelpers
} from "./templates";

const LOGGER = new PiLogger("EditorGenerator"); // .mute();

export class EditorGenerator {
    public outputfolder: string = ".";
    protected editorGenFolder: string;
    protected editorFolder: string;
    language: PiLanguageUnit;

    constructor() {    }

    generate(editor: PiDefEditorLanguage): void {
        this.editorFolder = this.outputfolder + "/" + EDITOR_FOLDER;
        this.editorGenFolder = this.outputfolder + "/" + EDITOR_GEN_FOLDER;
        let name = editor? editor.name : "";
        LOGGER.log("Generating editor '" + name + "' in folder " + this.editorGenFolder);

        const actions = new ActionsTemplate();
        const projection = new ProjectionTemplate();

        const enumProjection = new SelectionHelpers();
        const contextTemplate = new ContextTemplate();
        const projectionalEditorTemplate = new MainProjectionalEditorTemplate();
        const editorTemplate = new EditorTemplate();
        const editorIndexTemplate = new EditorIndexTemplate();

        //Prepare folders
        Helpers.createDirIfNotExisting(this.editorFolder);
        Helpers.createDirIfNotExisting(this.editorGenFolder);
        Helpers.deleteFilesInDir(this.editorGenFolder);

        // set relative path to get the imports right
        let relativePath = "../../";

        //  Generate it
        LOGGER.log("Generating projection default");
        var projectionfileDefault = Helpers.pretty(projection.generateProjectionDefault(this.language, relativePath), "Projection Default");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.projectionDefault(this.language)}.ts`, projectionfileDefault);

        LOGGER.log("Generating enumeration projections");
        var enumProjectionFile = Helpers.pretty(enumProjection.generateEnumProjection(this.language, relativePath), "Enumeration Projections");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.selectionHelpers(this.language)}.ts`, enumProjectionFile);

        LOGGER.log("Generating default actions");
        var defaultActionsFile = Helpers.pretty(actions.generateDefaultActions(this.language, relativePath), "DefaultActions");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.defaultActions(this.language)}.ts`, defaultActionsFile);

        LOGGER.log("Generating context");
        var contextFile = Helpers.pretty(contextTemplate.generateContext(this.language, relativePath), "Context");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.context(this.language)}.ts`, contextFile);

        LOGGER.log("Generating ProjectionalEditorManual");
        var projectionalEditorManualFile = Helpers.pretty(projection.generateProjection(this.language, relativePath), "ProjectionalEditorManual");
        Helpers.generateManualFile(`${this.editorFolder}/${Names.projection(this.language)}.ts`, projectionalEditorManualFile, "ManualProjections");

        LOGGER.log("Generating Editor");
        var editorFile = Helpers.pretty(editorTemplate.generateEditor(this.language, true, relativePath), "Editor");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.editor(this.language)}.ts`, editorFile);

        LOGGER.log("Generating MainProjectionalEditor");
        var projectionalEditorFile = Helpers.pretty(projectionalEditorTemplate.generateMainProjectionalEditor(this.language, true, relativePath), "MainProjectionalEditor");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.mainProjectionalEditor}.tsx`, projectionalEditorFile);

        // the following do not need the relativePath for imports
        LOGGER.log("Generating manual actions");
        var manualActionsFile = Helpers.pretty(actions.generateManualActions(this.language), "ManualActions");
        Helpers.generateManualFile(`${this.editorFolder}/${Names.manualActions(this.language)}.ts`, manualActionsFile, "ManualActions");

        LOGGER.log("Generating actions");        
        var actionsFile = Helpers.pretty(actions.generateActions(this.language), "Actions");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.actions(this.language)}.ts`, actionsFile);

        LOGGER.log("Generating editor gen index");
        var editorIndexGenFile = Helpers.pretty(editorIndexTemplate.generateGenIndex(this.language), "Editor Gen Index");
        fs.writeFileSync(`${this.editorGenFolder}/index.ts`, editorIndexGenFile);

        LOGGER.log("Generating editor index");
        var editorIndexFile = Helpers.pretty(editorIndexTemplate.generateIndex(this.language), "Editor Index");
        fs.writeFileSync(`${this.editorFolder}/index.ts`, editorIndexFile);

        LOGGER.log("Succesfully generated editor " + name);
    }

}
