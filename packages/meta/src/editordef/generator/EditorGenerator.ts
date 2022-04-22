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
import { PiEditUnit } from "../metalanguage";
import { ActionsTemplate, EditorIndexTemplate, ProjectionTemplate } from "./templates";
import { CustomActionsTemplate, CustomProjectionTemplate, DefaultActionsTemplate, StylesTemplate } from "./templates";
import { EditorDefTemplate } from "./templates/EditorDefTemplate";
import { LOG2USER } from "../../utils/UserLogger";

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

        this.getFolderNames();
        LOGGER.log("Generating editor in folder " + this.editorGenFolder + " for language " + this.language?.name);

        const generationStatus = new GenerationStatus();
        const defaultActions = new DefaultActionsTemplate();
        const customActions = new CustomActionsTemplate();
        const actions = new ActionsTemplate();
        const projection = new ProjectionTemplate();
        projection.setStandardBooleanKeywords(editDef); // initiate the template with the standard boolean keywords
        const customProjectiontemplate = new CustomProjectionTemplate();
        const editorIndexTemplate = new EditorIndexTemplate();
        const stylesTemplate = new StylesTemplate();
        const editorDefTemplate = new EditorDefTemplate();

        // Prepare folders
        Helpers.createDirIfNotExisting(this.editorFolder);  // will not be overwritten
        Helpers.createDirIfNotExisting(this.stylesFolder);  // will not be overwritten
        Helpers.createDirIfNotExisting(this.editorGenFolder);
        Helpers.deleteFilesInDir(this.editorGenFolder, generationStatus);

        // Set relative path to get the imports right
        const relativePath = "../../";

        // Generate the projection groups
        editDef.projectiongroups.forEach(group => {
            LOGGER.log(`Generating projection group: ${this.editorGenFolder}/${Names.projection(group)}.ts`);
            const projectionfile = Helpers.pretty(projection.generateProjectionGroup(this.language, group, relativePath),
                "Projection " + group.name, generationStatus);
            fs.writeFileSync(`${this.editorGenFolder}/${Names.projection(group)}.ts`, projectionfile);
        });

        // Generate the actions
        LOGGER.log(`Generating actions default: ${this.editorGenFolder}/${Names.defaultActions(this.language)}.ts`);
        const defaultActionsFile = Helpers.pretty(defaultActions.generate(this.language, editDef, relativePath), "DefaultActions", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/${Names.defaultActions(this.language)}.ts`, defaultActionsFile);

        LOGGER.log(`Generating editor language definition: ${this.editorGenFolder}/index.ts`);
        const editorDefFile = Helpers.pretty(editorDefTemplate.generateEditorDef(this.language, editDef, relativePath), "Editor Definition", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/EditorDef.ts`, editorDefFile);

        // the following do not need the relativePath for imports
        LOGGER.log(`Generating actions: ${this.editorGenFolder}/${Names.actions(this.language)}.ts`);
        const actionsFile = Helpers.pretty(actions.generate(this.language), "Actions", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/${Names.actions(this.language)}.ts`, actionsFile);

        LOGGER.log(`Generating custom actions: ${this.editorFolder}${Names.customActions(this.language)}.ts`);
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

        LOGGER.log(`Generating editor index: ${this.editorFolder}/index.ts`);
        const editorIndexFile = Helpers.pretty(editorIndexTemplate.generateIndex(this.language, editDef), "Editor Index", generationStatus);
        fs.writeFileSync(`${this.editorFolder}/index.ts`, editorIndexFile);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(`Generated editor with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Succesfully generated editor`);
        }
    }

    private getFolderNames() {
        this.editorFolder = this.outputfolder + "/" + EDITOR_FOLDER;
        this.stylesFolder = this.outputfolder + "/" + STYLES_FOLDER;
        this.editorGenFolder = this.outputfolder + "/" + EDITOR_GEN_FOLDER;
    }

    clean(force: boolean) {
        this.getFolderNames();
        Helpers.deleteDirAndContent(this.editorGenFolder);
        if (force) {
            Helpers.deleteFile(`${this.stylesFolder}/styles.ts`);
            Helpers.deleteFile(`${this.editorFolder}/index.ts`);
            Helpers.deleteDirIfEmpty(this.stylesFolder);
            if (this.language == null) {
                LOG2USER.error("Cannot remove all files because language is not set.");
            } else {
                Helpers.deleteFile(`${this.editorFolder}/${Names.customActions(this.language)}.ts`);
                Helpers.deleteFile(`${this.editorFolder}/${Names.customProjection(this.language)}.ts`);
                Helpers.deleteDirIfEmpty(this.editorFolder);
            }
        } else {
            // do not delete the following files, because these may contain user edits
            LOG2USER.info(`Not removed: ${this.editorFolder}/${Names.customActions(this.language)}.ts` +
                '\n\t' + `${this.editorFolder}/${Names.customProjection(this.language)}.ts` +
                '\n\t' + `${this.editorFolder}/index.ts` +
                '\n\t' + `${this.stylesFolder}/styles.ts`
            );
        }
    }
}
