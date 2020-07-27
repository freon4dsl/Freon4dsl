import * as fs from "fs";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLanguage } from "../../languagedef/metalanguage";
import { EDITOR_FOLDER, EDITOR_GEN_FOLDER, GenerationStatus, Helpers, Names, STYLES_FOLDER } from "../../utils";
import { PiEditUnit } from "../metalanguage";
import { PiEditProjectionUtil } from "../metalanguage/PiEditProjectionUtil";
import { ActionsTemplate, EditorIndexTemplate, ProjectionTemplate, SelectionHelpers } from "./templates";
import { CustomActionsTemplate } from "./templates/CustomActionsTemplate";
import { CustomProjectionTemplate } from "./templates/CustomProjectionTemplate";
import { DefaultActionsTemplate } from "./templates/DefaultActionsTemplate";
import { InitalizationTemplate } from "./templates/InitializationTemplate";
import { StylesTemplate } from "./templates/StylesTemplate";

const LOGGER = new PiLogger("EditorGenerator"); //.mute();

export class EditorGenerator {
    public outputfolder: string = ".";
    protected editorGenFolder: string;
    protected editorFolder: string;
    protected stylesFolder: string;
    language: PiLanguage;

    constructor() {
    }

    generate(editDef: PiEditUnit): void {
        let generationStatus = new GenerationStatus();
        this.editorFolder = this.outputfolder + "/" + EDITOR_FOLDER;
        this.stylesFolder = this.outputfolder + "/" + STYLES_FOLDER;
        this.editorGenFolder = this.outputfolder + "/" + EDITOR_GEN_FOLDER;
        let name = editDef ? editDef.name : "";
        LOGGER.log("Generating editor '" + name + "' in folder " + this.editorGenFolder + " for language " + this.language?.name);
        if (editDef == null || editDef == undefined) {
            editDef = this.createDefaultEditorDefinition();
        }
        editDef.language = this.language;
        // add default values if they are not present in the editor definition
        PiEditProjectionUtil.addDefaults(editDef);

        const defaultActions = new DefaultActionsTemplate();
        const customActions = new CustomActionsTemplate();
        const actions = new ActionsTemplate();
        const projection = new ProjectionTemplate();
        const customProjectiontemplate = new CustomProjectionTemplate();
        const enumProjection = new SelectionHelpers();
        const editorIndexTemplate = new EditorIndexTemplate();
        const initializationTemplate = new InitalizationTemplate();
        const stylesTemplate = new StylesTemplate();

        //Prepare folders
        Helpers.createDirIfNotExisting(this.editorFolder);  // will not be overwritten
        Helpers.createDirIfNotExisting(this.stylesFolder);  // will not be overwritten
        Helpers.createDirIfNotExisting(this.editorGenFolder);
        Helpers.deleteFilesInDir(this.editorGenFolder, generationStatus);

        // set relative path to get the imports right
        let relativePath = "../../";

        //  Generate it
        LOGGER.log(`Generating projection default: ${this.editorGenFolder}/${Names.projectionDefault(this.language)}.ts`);
        var projectionfileDefault = Helpers.pretty(projection.generateProjectionDefault(this.language, editDef, relativePath), "Projection Default", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/${Names.projectionDefault(this.language)}.ts`, projectionfileDefault);

        LOGGER.log(`Generating enumeration projections: ${this.editorGenFolder}/${Names.selectionHelpers(this.language)}.ts`);
        var enumProjectionFile = Helpers.pretty(enumProjection.generateEnumProjection(this.language, editDef, relativePath), "Enumeration Projections", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/${Names.selectionHelpers(this.language)}.ts`, enumProjectionFile);

        LOGGER.log(`Generating default actions: ${this.editorGenFolder}/${Names.defaultActions(this.language)}.ts`);
        var defaultActionsFile = Helpers.pretty(defaultActions.generate(this.language, editDef, relativePath), "DefaultActions", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/${Names.defaultActions(this.language)}.ts`, defaultActionsFile);

        // use different relative path
        LOGGER.log(`Generating initialization: ${this.editorFolder}${Names.initialization(this.language)}.ts`);
        var initializationFile = Helpers.pretty(initializationTemplate.generate(this.language, "../"), "Initialization", generationStatus);
        Helpers.generateManualFile(`${this.editorFolder}/${Names.initialization(this.language)}.ts`, initializationFile, "Initialization");

        // the following do not need the relativePath for imports
        LOGGER.log(`Generating actions: ${this.editorGenFolder}/${Names.actions(this.language)}.ts`);
        var actionsFile = Helpers.pretty(actions.generate(this.language, editDef), "Actions", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/${Names.actions(this.language)}.ts`, actionsFile);

        LOGGER.log(`Generating manual actions: ${this.editorFolder}${Names.customActions(this.language)}.ts`);
        var customActionsFile = Helpers.pretty(customActions.generate(this.language), "CustomActions", generationStatus);
        Helpers.generateManualFile(`${this.editorFolder}/${Names.customActions(this.language)}.ts`, customActionsFile, "CustomActions");

        LOGGER.log(`Generating custom projection: ${this.editorFolder}${Names.customProjection(this.language)}.ts`);
        var customProjectionFile = Helpers.pretty(customProjectiontemplate.generate(this.language), "Custom Projection", generationStatus);
        Helpers.generateManualFile(`${this.editorFolder}/${Names.customProjection(this.language)}.ts`, customProjectionFile, "Custom Projection");

        LOGGER.log(`Generating editor styles part 1: ${this.stylesFolder}/styles.ts`);
        var editorStylesConst = Helpers.pretty(stylesTemplate.generateConst(), "Editor Styles constant", generationStatus);
        Helpers.generateManualFile(`${this.stylesFolder}/styles.ts`, editorStylesConst, "Editor Styles Constant");

        LOGGER.log(`Generating editor styles part 2: ${this.stylesFolder}/style.scss`);
        var editorStylesConst = stylesTemplate.generateSCSS();
        Helpers.generateManualFile(`${this.stylesFolder}/style.scss`, editorStylesConst, "Editor Styles scss");

        LOGGER.log(`Generating editor gen index: ${this.editorGenFolder}/index.ts`);
        var editorIndexGenFile = Helpers.pretty(editorIndexTemplate.generateGenIndex(this.language, editDef), "Editor Gen Index", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/index.ts`, editorIndexGenFile);

        LOGGER.log(`Generating editor index: ${this.editorFolder}/index.ts`);
        var editorIndexFile = Helpers.pretty(editorIndexTemplate.generateIndex(this.language, editDef), "Editor Index", generationStatus);
        fs.writeFileSync(`${this.editorFolder}/index.ts`, editorIndexFile);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.info(this, `Generated editor '${name}' with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(this, `Succesfully generated editor ${name}`);
        }
    }

    public createDefaultEditorDefinition(): PiEditUnit {
        let editDef = new PiEditUnit();
        editDef.name = "default";
        editDef.languageName = this.language.name;
        return editDef;
    }
}
