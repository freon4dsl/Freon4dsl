import * as fs from "fs";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLanguageUnit } from "../../languagedef/metalanguage";
import { EDITOR_FOLDER, EDITOR_GEN_FOLDER, Helpers, Names, UNPARSER_GEN_FOLDER } from "../../utils";
import { DefEditorLanguage } from "../metalanguage";
import { DefEditorDefaults } from "../metalanguage/DefEditorDefaults";
import { ActionsTemplate, EditorIndexTemplate, ProjectionTemplate, SelectionHelpers, UnparserTemplate } from "./templates";
import { CustomActionsTemplate } from "./templates/CustomActionsTemplate";
import { CustomProjectionTemplate } from "./templates/CustomProjectionTemplate";
import { DefaultActionsTemplate } from "./templates/DefaultActionsTemplate";
import { InitalizationTemplate } from "./templates/InitializationTemplate";

const LOGGER = new PiLogger("EditorGenerator"); //.mute();

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
        const customActions = new CustomActionsTemplate();
        const actions = new ActionsTemplate();
        const projection = new ProjectionTemplate();
        const customProjectiontemplate = new CustomProjectionTemplate();

        const enumProjection = new SelectionHelpers();
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
        LOGGER.log(`Generating projection default: ${this.editorGenFolder}/${Names.projectionDefault(this.language)}.ts`);
        var projectionfileDefault = Helpers.pretty(projection.generateProjectionDefault(this.language, editDef, relativePath), "Projection Default");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.projectionDefault(this.language)}.ts`, projectionfileDefault);

        LOGGER.log(`Generating enumeration projections: ${this.editorGenFolder}/${Names.selectionHelpers(this.language)}.ts`);
        var enumProjectionFile = Helpers.pretty(enumProjection.generateEnumProjection(this.language, editDef, relativePath), "Enumeration Projections");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.selectionHelpers(this.language)}.ts`, enumProjectionFile);

        LOGGER.log(`Generating default actions: ${this.editorGenFolder}/${Names.defaultActions(this.language)}.ts`);
        var defaultActionsFile = Helpers.pretty(defaultActions.generate(this.language, editDef, relativePath), "DefaultActions");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.defaultActions(this.language)}.ts`, defaultActionsFile);

        // the following do not need the relativePath for imports
        LOGGER.log(`Generating actions: ${this.editorGenFolder}/${Names.actions(this.language)}.ts`);
        var actionsFile = Helpers.pretty(actions.generate(this.language, editDef), "Actions");
        fs.writeFileSync(`${this.editorGenFolder}/${Names.actions(this.language)}.ts`, actionsFile);

        LOGGER.log(`Generating manual actions: ${this.editorFolder}${Names.customActions(this.language)}.ts`);
        var customActionsFile = Helpers.pretty(customActions.generate(this.language, editDef), "CustomActions");
        Helpers.generateManualFile(`${this.editorFolder}/${Names.customActions(this.language)}.ts`, customActionsFile, "CustomActions");

        LOGGER.log(`Generating initialization: ${this.editorFolder}${Names.initialization(this.language)}.ts`);
        var initializationFile = Helpers.pretty(initializationTemplate.generate(this.language), "Initialization");
        Helpers.generateManualFile(`${this.editorFolder}/${Names.initialization(this.language)}.ts`, initializationFile, "Initialization");

        LOGGER.log(`Generating custom projection: ${this.editorFolder}${Names.customProjection(this.language)}.ts`);
        var customProjectionFile = Helpers.pretty(customProjectiontemplate.generate(this.language), "Custom Projection");
        Helpers.generateManualFile(`${this.editorFolder}/${Names.customProjection(this.language)}.ts`, customProjectionFile, "Custom Projection");

        LOGGER.log(`Generating language unparser: ${this.unparserGenFolder}/${Names.unparser(this.language)}.ts`);
        var unparserFile = Helpers.pretty(unparserTemplate.generateUnparser(this.language, editDef, relativePath), "Unparser Class");
        // var unparserFile = unparserTemplate.generateUnparser(this.language, editDef, relativePath);
        fs.writeFileSync(`${this.unparserGenFolder}/${Names.unparser(this.language)}.ts`, unparserFile);

        LOGGER.log(`Generating editor gen index: ${this.editorGenFolder}/index.ts`);
        var editorIndexGenFile = Helpers.pretty(editorIndexTemplate.generateGenIndex(this.language, editDef), "Editor Gen Index");
        fs.writeFileSync(`${this.editorGenFolder}/index.ts`, editorIndexGenFile);

        LOGGER.log(`Generating editor index: ${this.editorFolder}/index.ts`);
        var editorIndexFile = Helpers.pretty(editorIndexTemplate.generateIndex(this.language, editDef), "Editor Index");
        fs.writeFileSync(`${this.editorFolder}/index.ts`, editorIndexFile);

        LOGGER.log("Succesfully generated editor " + name);
    }
}
