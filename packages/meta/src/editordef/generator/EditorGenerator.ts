import { DefEditorChecker, DefEditorLanguage } from "../metalanguage";
import { PiLanguageUnit } from "../../languagedef/metalanguage";
import * as fs from "fs";
import { Names, Helpers, EDITOR_GEN_FOLDER, EDITOR_FOLDER, LANGUAGE_UTILS_GEN_FOLDER, UNPARSER_GEN_FOLDER } from "../../utils";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { DefEditorDefaults } from "../metalanguage/DefEditorDefaults";
import {
    ActionsTemplate,
    ContextTemplate,
    EditorIndexTemplate,
    EditorTemplate,
    ProjectionTemplate,
    SelectionHelpers,
    UnparserTemplate
} from "./templates";
import { DefaultActionsTemplate } from "./templates/DefaultActionsTemplate";
import { InitalizationTemplate } from "./templates/InitializationTemplate";
import { ManualActionsTemplate } from "./templates/ManualActionsTemplate";

const LOGGER = new PiLogger("EditorGenerator").mute();

export class EditorGenerator {
    public outputfolder: string = ".";
    protected editorGenFolder: string;
    protected unparserGenFolder: string;

    protected editorFolder: string;
    language: PiLanguageUnit;

    constructor() {
    }

    generate(editDef: DefEditorLanguage): void {
        this.editorFolder = this.outputfolder + "/" + EDITOR_FOLDER;
        this.editorGenFolder = this.outputfolder + "/" + EDITOR_GEN_FOLDER;
        this.unparserGenFolder = this.outputfolder + "/" + UNPARSER_GEN_FOLDER;
        let name = editDef ? editDef.name : "";
        LOGGER.log("Generating editor '" + name + "' in folder " + this.editorGenFolder + " for language " + this.language?.name);

        if (editDef === null || editDef === undefined) {
            editDef = new DefEditorLanguage();
            editDef.name = "default";
            editDef.languageName = this.language.name;
        }
        editDef.language = this.language;
        // fill default values if they are not there
        DefEditorDefaults.addDefaults(editDef);

        const defaultActions = new DefaultActionsTemplate();
        const manualActions = new ManualActionsTemplate();
        const actions = new ActionsTemplate();
        const projection = new ProjectionTemplate();

        const enumProjection = new SelectionHelpers();
        const contextTemplate = new ContextTemplate();
        const editorTemplate = new EditorTemplate();
        const editorIndexTemplate = new EditorIndexTemplate();
        const unparserTemplate = new UnparserTemplate();
        const initializationTemplate = new InitalizationTemplate();

        //Prepare folders
        Helpers.createDirIfNotExisting(this.editorFolder);
        Helpers.createDirIfNotExisting(this.editorGenFolder);
        Helpers.deleteFilesInDir(this.editorGenFolder);
        Helpers.createDirIfNotExisting(this.unparserGenFolder);
        Helpers.deleteFilesInDir(this.unparserGenFolder);

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
        var defaultActionsFile = Helpers.pretty(defaultActions.generate(this.language, editDef, relativePath), "DefaultActions");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.defaultActions(this.language)}.ts`, defaultActionsFile);

        LOGGER.log(`Generating context: ${Names.context(this.language)}.ts`);
        var contextFile = Helpers.pretty(contextTemplate.generateContext(this.language, editDef, relativePath), "Context");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.context(this.language)}.ts`, contextFile);

        LOGGER.log(`Generating ProjectionalEditorManual: ${Names.projection(this.language)}.ts`);
        var projectionalEditorManualFile = Helpers.pretty(projection.generateProjection(this.language, editDef, relativePath), "ProjectionalEditorManual");
        Helpers.generateManualFile(`${this.editorFolder}/${Names.projection(this.language)}.ts`, projectionalEditorManualFile, "ManualProjections");

        LOGGER.log(`Generating Editor: ${Names.editor(this.language)}.ts`);
        var editorFile = Helpers.pretty(editorTemplate.generateEditor(this.language, editDef, relativePath), "Editor");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.editor(this.language)}.ts`, editorFile);

        // the following do not need the relativePath for imports
        LOGGER.log(`Generating manual actions: ${Names.manualActions(this.language)}.ts`);
        var manualActionsFile = Helpers.pretty(manualActions.generate(this.language, editDef), "ManualActions");
        Helpers.generateManualFile(`${this.editorFolder}/${Names.manualActions(this.language)}.ts`, manualActionsFile, "ManualActions");

        LOGGER.log(`Generating initialization: ${Names.initialization(this.language)}.ts`);
        var initializationFile = Helpers.pretty(initializationTemplate.generate(this.language), "Initialization");
        Helpers.generateManualFile(`${this.editorFolder}/${Names.initialization(this.language)}.ts`, initializationFile, "Initialization");

        LOGGER.log(`Generating actions: ${Names.actions(this.language)}.ts`);
        var actionsFile = Helpers.pretty(actions.generate(this.language, editDef), "Actions");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.actions(this.language)}.ts`, actionsFile);

        LOGGER.log(`Generating language unparser: ${Names.unparser(this.language)}.ts`);
        var unparserFile = Helpers.pretty(unparserTemplate.generateUnparser(this.language, editDef, relativePath), "Unparser Class");
        // var unparserFile = unparserTemplate.generateUnparser(this.language, editDef, relativePath);
        fs.writeFileSync(`${this.unparserGenFolder}/${Names.unparser(this.language)}.ts`, unparserFile);

        LOGGER.log(`Generating editor gen index: ${this.editorGenFolder}/index.ts`);
        var editorIndexGenFile = Helpers.pretty(editorIndexTemplate.generateGenIndex(this.language, editDef), "Editor Gen Index");
        fs.writeFileSync(`${this.editorGenFolder}/index.ts`, editorIndexGenFile);

        LOGGER.log(`Generating editor index: index.ts`);
        var editorIndexFile = Helpers.pretty(editorIndexTemplate.generateIndex(this.language, editDef), "Editor Index");
        fs.writeFileSync(`${this.editorFolder}/index.ts`, editorIndexFile);

        LOGGER.log("Succesfully generated editor " + name);
    }
}
