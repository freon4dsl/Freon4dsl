import { DefEditorLanguage } from "../metalanguage";
import { PiLanguageUnit } from "../../languagedef/metalanguage";
import * as fs from "fs";
import { Names, Helpers, EDITOR_GEN_FOLDER, EDITOR_FOLDER, LANGUAGE_UTILS_GEN_FOLDER } from "../../utils";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import {
    ActionsTemplate,
    ContextTemplate,
    EditorIndexTemplate,
    EditorTemplate,
    MainProjectionalEditorTemplate,
    ProjectionTemplate,
    SelectionHelpers,
    UnparserTemplate
} from "./templates";

const LOGGER = new PiLogger("EditorGenerator"); // .mute();

export class EditorGenerator {
    public outputfolder: string = ".";
    protected editorGenFolder: string;
    protected utilsGenFolder: string;

    protected editorFolder: string;
    language: PiLanguageUnit;

    constructor() {}

    generate(editDef: DefEditorLanguage): void {
        this.editorFolder = this.outputfolder + "/" + EDITOR_FOLDER;
        this.editorGenFolder = this.outputfolder + "/" + EDITOR_GEN_FOLDER;
        this.utilsGenFolder = this.outputfolder + "/" + LANGUAGE_UTILS_GEN_FOLDER;
        let name = editDef? editDef.name : "";
        LOGGER.log("Generating editor '" + name + "' in folder " + this.editorGenFolder);

        if(editDef === null || editDef === undefined) {
            editDef = new DefEditorLanguage();
        }
        editDef.language = this.language;
        // fill default valuies if they are not there
        editDef.addDefaults();

        const actions = new ActionsTemplate();
        const projection = new ProjectionTemplate();

        const enumProjection = new SelectionHelpers();
        const contextTemplate = new ContextTemplate();
        const projectionalEditorTemplate = new MainProjectionalEditorTemplate();
        const editorTemplate = new EditorTemplate();
        const editorIndexTemplate = new EditorIndexTemplate();
        const unparserTemplate = new UnparserTemplate();

        //Prepare folders
        Helpers.createDirIfNotExisting(this.editorFolder);
        Helpers.createDirIfNotExisting(this.editorGenFolder);
        Helpers.deleteFilesInDir(this.editorGenFolder);

        // set relative path to get the imports right
        let relativePath = "../../";

        //  Generate it
        LOGGER.log(`Generating projection default: /${Names.projectionDefault(this.language)}.ts`);
        var projectionfileDefault = Helpers.pretty(projection.generateProjectionDefault(this.language, editDef, relativePath), "Projection Default");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.projectionDefault(this.language)}.ts`, projectionfileDefault);

        LOGGER.log(`Generating enumeration projections: ${Names.selectionHelpers(this.language)}.ts`);
        var enumProjectionFile = Helpers.pretty(enumProjection.generateEnumProjection(this.language, editDef, relativePath), "Enumeration Projections");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.selectionHelpers(this.language)}.ts`, enumProjectionFile);

        LOGGER.log(`Generating default actions: ${Names.defaultActions(this.language)}.ts`);
        var defaultActionsFile = Helpers.pretty(actions.generateDefaultActions(this.language, editDef, relativePath), "DefaultActions");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.defaultActions(this.language)}.ts`, defaultActionsFile);

        LOGGER.log(`Generating context: ${Names.context(this.language)}.ts`);
        var contextFile = Helpers.pretty(contextTemplate.generateContext(this.language, editDef, relativePath), "Context");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.context(this.language)}.ts`, contextFile);

        LOGGER.log(`Generating ProjectionalEditorManual: ${Names.projection(this.language)}.ts`);
        var projectionalEditorManualFile = Helpers.pretty(
            projection.generateProjection(this.language, editDef, relativePath),
            "ProjectionalEditorManual"
        );
        Helpers.generateManualFile(`${this.editorFolder}/${Names.projection(this.language)}.ts`, projectionalEditorManualFile, "ManualProjections");

        LOGGER.log(`Generating Editor: ${Names.editor(this.language)}.ts`);
        var editorFile = Helpers.pretty(editorTemplate.generateEditor(this.language, editDef, relativePath), "Editor");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.editor(this.language)}.ts`, editorFile);

        LOGGER.log(`Generating MainProjectionalEditor: ${Names.mainProjectionalEditor}.tsx`);
        var projectionalEditorFile = Helpers.pretty(projectionalEditorTemplate.generateMainProjectionalEditor(this.language, editDef, relativePath), "MainProjectionalEditor");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.mainProjectionalEditor}.tsx`, projectionalEditorFile);

        // the following do not need the relativePath for imports
        LOGGER.log(`Generating manual actions: ${Names.manualActions(this.language)}.ts`);
        var manualActionsFile = Helpers.pretty(actions.generateManualActions(this.language, editDef), "ManualActions");
        Helpers.generateManualFile(`${this.editorFolder}/${Names.manualActions(this.language)}.ts`, manualActionsFile, "ManualActions");

        LOGGER.log(`Generating actions: ${Names.actions(this.language)}.ts`);
        var actionsFile = Helpers.pretty(actions.generateActions(this.language, editDef), "Actions");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.actions(this.language)}.ts`, actionsFile);

        LOGGER.log(`Generating language unparser: ${Names.unparser(this.language)}.ts`);
        var unparserFile = Helpers.pretty(unparserTemplate.generateUnparser(this.language, editDef, relativePath), "Unparser Class");
        // var unparserFile = unparserTemplate.generateUnparser(this.language, editDef, relativePath);
        fs.writeFileSync(`${this.utilsGenFolder}/${Names.unparser(this.language)}.ts`, unparserFile);

        LOGGER.log(`Generating editor gen index: ${this.editorGenFolder}/index.ts`);
        var editorIndexGenFile = Helpers.pretty(editorIndexTemplate.generateGenIndex(this.language, editDef), "Editor Gen Index");
        fs.writeFileSync(`${this.editorGenFolder}/index.ts`, editorIndexGenFile);

        LOGGER.log(`Generating editor index: index.ts`);
        var editorIndexFile = Helpers.pretty(editorIndexTemplate.generateIndex(this.language, editDef), "Editor Index");
        fs.writeFileSync(`${this.editorFolder}/index.ts`, editorIndexFile);

        LOGGER.log("Succesfully generated editor " + name);
    }
}
