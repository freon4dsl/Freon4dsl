import * as fs from "fs";
import { MetaLogger } from "../../utils";
import { PiLanguage } from "../../languagedef/metalanguage";
import {
    EDITOR_FOLDER,
    EDITOR_GEN_FOLDER,
    GenerationStatus,
    Helpers,
    isNullOrUndefined,
    Names,
    STYLES_FOLDER
} from "../../utils";
import { PiEditProjectionGroup, PiEditUnit } from "../metalanguage";
import { ActionsTemplate, EditorIndexTemplate, ProjectionTemplate } from "./templates";
import { CustomActionsTemplate, CustomProjectionTemplate, DefaultActionsTemplate, StylesTemplate } from "./templates";
import { EditorDefTemplate } from "./templates/EditorDefTemplate";

const LOGGER = new MetaLogger("EditorGenerator").mute();

export class EditorGenerator {
    public outputfolder: string = ".";
    protected editorGenFolder: string;
    protected editorFolder: string;
    protected stylesFolder: string;
    language: PiLanguage;

    generate(editDef: PiEditUnit): void {
        if (isNullOrUndefined(this.language)) {
            LOGGER.error("Cannot generate editor because language is not set.");
            return;
        }
        if (isNullOrUndefined(editDef)) {
            LOGGER.error("Cannot generate editor because editor definition is null or undefined.");
            return;
        }

        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        const name = editDef ? editDef.getDefaultProjectiongroup().name : "";
        LOGGER.log("Generating editor '" + name + "' in folder " + this.editorGenFolder + " for language " + this.language?.name);

        // TODO the following should already have been set by the edit checker, but it seems to be needed here
        editDef.language = this.language;

        const defaultActions = new DefaultActionsTemplate();
        const customActions = new CustomActionsTemplate();
        const actions = new ActionsTemplate();
        const projection = new ProjectionTemplate();
        const customProjectiontemplate = new CustomProjectionTemplate();
        const editorIndexTemplate = new EditorIndexTemplate();
        const stylesTemplate = new StylesTemplate();
        const editorDefTemplate = new EditorDefTemplate();

        // Prepare folders
        Helpers.createDirIfNotExisting(this.editorFolder);  // will not be overwritten
        Helpers.createDirIfNotExisting(this.stylesFolder);  // will not be overwritten
        Helpers.createDirIfNotExisting(this.editorGenFolder);
        Helpers.deleteFilesInDir(this.editorGenFolder, generationStatus);

        // set relative path to get the imports right
        const relativePath = "../../";

        //  Generate it
        LOGGER.log(`Generating projection default: ${this.editorGenFolder}/${Names.projectionDefault(this.language)}.ts`);
        const projectionfileDefault = Helpers.pretty(projection.generateProjectionDefault(this.language, editDef, relativePath),
            "Projection Default", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/${Names.projectionDefault(this.language)}.ts`, projectionfileDefault);

        // TODO generate the other projection groups

        LOGGER.log(`Generating default actions: ${this.editorGenFolder}/${Names.defaultActions(this.language)}.ts`);
        const defaultActionsFile = Helpers.pretty(defaultActions.generate(this.language, editDef, relativePath), "DefaultActions", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/${Names.defaultActions(this.language)}.ts`, defaultActionsFile);

        // the following do not need the relativePath for imports
        LOGGER.log(`Generating actions: ${this.editorGenFolder}/${Names.actions(this.language)}.ts`);
        const actionsFile = Helpers.pretty(actions.generate(this.language, editDef), "Actions", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/${Names.actions(this.language)}.ts`, actionsFile);

        LOGGER.log(`Generating manual actions: ${this.editorFolder}${Names.customActions(this.language)}.ts`);
        const customActionsFile = Helpers.pretty(customActions.generate(this.language), "CustomActions", generationStatus);
        Helpers.generateManualFile(`${this.editorFolder}/${Names.customActions(this.language)}.ts`, customActionsFile, "CustomActions");

        LOGGER.log(`Generating custom projection: ${this.editorFolder}${Names.customProjection(this.language)}.ts`);
        const customProjectionFile = Helpers.pretty(customProjectiontemplate.generate(this.language), "Custom Projection", generationStatus);
        Helpers.generateManualFile(`${this.editorFolder}/${Names.customProjection(this.language)}.ts`, customProjectionFile, "Custom Projection");

        LOGGER.log(`Generating editor styles: ${this.stylesFolder}/CustomStyles.ts`);
        const editorStylesConst = Helpers.pretty(stylesTemplate.generateConst(), "Editor Styles constant", generationStatus);
        Helpers.generateManualFile(`${this.stylesFolder}/CustomStyles.ts`, editorStylesConst, "Editor Styles Constant");

        LOGGER.log(`Generating editor gen index: ${this.editorGenFolder}/index.ts`);
        const editorIndexGenFile = Helpers.pretty(editorIndexTemplate.generateGenIndex(this.language, editDef), "Editor Gen Index", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/index.ts`, editorIndexGenFile);

        LOGGER.log(`Generating editor gen index: ${this.editorGenFolder}/index.ts`);
        const editorDefFile = Helpers.pretty(editorDefTemplate.generateEditorDef(this.language, editDef), "Editor Definition", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/EditorDef.ts`, editorDefFile);

        LOGGER.log(`Generating editor index: ${this.editorFolder}/index.ts`);
        const editorIndexFile = Helpers.pretty(editorIndexTemplate.generateIndex(this.language, editDef), "Editor Index", generationStatus);
        fs.writeFileSync(`${this.editorFolder}/index.ts`, editorIndexFile);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(`Generated editor '${name}' with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Succesfully generated editor ${name}`);
        }
    }

    private getFolderNames() {
        this.editorFolder = this.outputfolder + "/" + EDITOR_FOLDER;
        this.stylesFolder = this.outputfolder + "/" + STYLES_FOLDER;
        this.editorGenFolder = this.outputfolder + "/" + EDITOR_GEN_FOLDER;
    }

    public createEmptyEditorDefinition(): PiEditUnit {
        const editDef = new PiEditUnit();
        editDef.language = this.language;
        const defaultGroup = new PiEditProjectionGroup();
        defaultGroup.name = Names.defaultProjectionName;
        editDef.projectiongroups.push(defaultGroup);
        return editDef;
    }

    clean(force: boolean) {
        this.getFolderNames();
        Helpers.deleteDirAndContent(this.editorGenFolder);
        if (force) {
            Helpers.deleteFile(`${this.stylesFolder}/styles.ts`);
            Helpers.deleteFile(`${this.editorGenFolder}/index.ts`);
            Helpers.deleteFile(`${this.editorFolder}/index.ts`);
            Helpers.deleteDirIfEmpty(this.editorGenFolder);
            Helpers.deleteDirIfEmpty(this.stylesFolder);
            if (this.language == null) {
                LOGGER.error("Cannot remove all because language is not set.");
            } else {
                Helpers.deleteFile(`${this.editorFolder}/${Names.customActions(this.language)}.ts`);
                Helpers.deleteFile(`${this.editorFolder}/${Names.customProjection(this.language)}.ts`);
                Helpers.deleteDirIfEmpty(this.editorFolder);
            }
        } else {
            // do not delete the following files, because these may contain user edits
            LOGGER.info(`Not removed: ${this.editorFolder}/${Names.customActions(this.language)}.ts` +
                '\n\t' + `${this.editorFolder}/${Names.customProjection(this.language)}.ts` +
                '\n\t' + `${this.editorFolder}/index.ts` +
                '\n\t' + `${this.stylesFolder}/styles.ts` +
                '\n\t' + `${this.editorGenFolder}/index.ts`
            );
        }
    }
}
