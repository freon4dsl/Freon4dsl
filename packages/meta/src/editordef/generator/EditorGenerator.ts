import * as fs from "fs";
import { ListUtil, MetaLogger } from "../../utils";
import { PiClassifier, PiConcept, PiLanguage, PiLimitedConcept } from "../../languagedef/metalanguage";
import {
    EDITOR_FOLDER,
    EDITOR_GEN_FOLDER,
    GenerationStatus,
    FileUtil,
    isNullOrUndefined,
    Names,
    STYLES_FOLDER
} from "../../utils";
import { PiEditUnit } from "../metalanguage";
import { ActionsTemplate, EditorIndexTemplate, ProjectionTemplate } from "./templates";
import { CustomActionsTemplate, CustomProjectionTemplate, DefaultActionsTemplate, StylesTemplate } from "./templates";
import { EditorDefTemplate } from "./templates";
import { LOG2USER } from "../../utils";

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
        // const stylesTemplate = new StylesTemplate();
        const editorDefTemplate = new EditorDefTemplate();

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.editorFolder);  // will not be overwritten
        FileUtil.createDirIfNotExisting(this.stylesFolder);  // will not be overwritten
        FileUtil.createDirIfNotExisting(this.editorGenFolder);
        FileUtil.deleteFilesInDir(this.editorGenFolder, generationStatus);

        // Set relative path to get the imports right
        const relativePath = "../../";

        // todo removed commented lines
        // Generate the projection groups
        // editDef.projectiongroups.forEach(group => {
        //     LOGGER.log(`Generating projection group: ${this.editorGenFolder}/${Names.projection(group)}.ts`);
        //     const projectionfile = FileUtil.pretty(projection.generateProjectionGroup(this.language, group, relativePath),
        //         "Projection " + group.name, generationStatus);
        //     fs.writeFileSync(`${this.editorGenFolder}/${Names.projection(group)}.ts`, projectionfile);
        // });

        // Generate the box providers
        // const providercache = FileUtil.pretty(projection.generateBoxProviderCache(this.language, editDef, relativePath), "providercache", generationStatus);
        // fs.writeFileSync(`${this.editorGenFolder}/${Names.boxProviderCache(this.language)}.ts`, providercache);

        // During generation, we may conclude that extra box providers classes need to be generated.
        // We keep the classifiers for which this is necessary in the list 'extraClassifiers'.
        let extraClassifiers: PiClassifier[] = [];
        this.language.concepts.forEach(concept => {
            if (!(concept instanceof PiLimitedConcept) && !concept.isAbstract) {
                const projectionfile = FileUtil.pretty(projection.generateBoxProvider(this.language, concept, editDef, extraClassifiers, relativePath),
                    "Box provider " + concept.name, generationStatus);
                fs.writeFileSync(`${this.editorGenFolder}/${Names.boxProvider(concept)}.ts`, projectionfile);
            }
        });

        this.language.units.forEach(concept => {
            const projectionfile = FileUtil.pretty(projection.generateBoxProvider(this.language, concept, editDef, extraClassifiers, relativePath),
                "Box provider " + concept.name, generationStatus);
            fs.writeFileSync(`${this.editorGenFolder}/${Names.boxProvider(concept)}.ts`, projectionfile);
        });

        const allExtraClassifiers: PiClassifier[] = []; // remember these in order to add them to the index file
        ListUtil.addListIfNotPresent(allExtraClassifiers, extraClassifiers);
        while (extraClassifiers.length > 0) { // super projections may call other super projections, make sure every one has a BoxProvider
            let newExtraClassifiers: PiClassifier[] = [];
            extraClassifiers.forEach(cls => {
                if (cls instanceof PiConcept && !cls.isAbstract) {
                    // do nothing, already generated
                } else {
                    const projectionfile = FileUtil.pretty(projection.generateBoxProvider(this.language, cls, editDef, newExtraClassifiers, relativePath),
                        "Box provider " + cls.name, generationStatus);
                    fs.writeFileSync(`${this.editorGenFolder}/${Names.boxProvider(cls)}.ts`, projectionfile);
                }
            });
            extraClassifiers = newExtraClassifiers;
            ListUtil.addListIfNotPresent(allExtraClassifiers, extraClassifiers);
        }

        // Generate the actions
        LOGGER.log(`Generating actions default: ${this.editorGenFolder}/${Names.defaultActions(this.language)}.ts`);
        const defaultActionsFile = FileUtil.pretty(defaultActions.generate(this.language, editDef, relativePath), "DefaultActions", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/${Names.defaultActions(this.language)}.ts`, defaultActionsFile);

        LOGGER.log(`Generating editor language definition: ${this.editorGenFolder}/index.ts`);
        const editorDefFile = FileUtil.pretty(editorDefTemplate.generateEditorDef(this.language, editDef, relativePath), "Editor Definition", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/EditorDef.ts`, editorDefFile);

        // the following do not need the relativePath for imports
        LOGGER.log(`Generating actions: ${this.editorGenFolder}/${Names.actions(this.language)}.ts`);
        const actionsFile = FileUtil.pretty(actions.generate(this.language), "Actions", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/${Names.actions(this.language)}.ts`, actionsFile);

        LOGGER.log(`Generating custom actions: ${this.editorFolder}${Names.customActions(this.language)}.ts`);
        const customActionsFile = FileUtil.pretty(customActions.generate(this.language), "CustomActions", generationStatus);
        FileUtil.generateManualFile(`${this.editorFolder}/${Names.customActions(this.language)}.ts`, customActionsFile, "CustomActions");

        LOGGER.log(`Generating custom projection: ${this.editorFolder}${Names.customProjection(this.language)}.ts`);
        const customProjectionFile = FileUtil.pretty(customProjectiontemplate.generate(this.language), "Custom Projection", generationStatus);
        FileUtil.generateManualFile(`${this.editorFolder}/${Names.customProjection(this.language)}.ts`, customProjectionFile, "Custom Projection");

        // LOGGER.log(`Generating editor styles: ${this.stylesFolder}/CustomStyles.ts`);
        // const editorStylesConst = FileUtil.pretty(stylesTemplate.generateConst(), "Editor Styles constant", generationStatus);
        // FileUtil.generateManualFile(`${this.stylesFolder}/CustomStyles.ts`, editorStylesConst, "Editor Styles Constant");

        LOGGER.log(`Generating editor gen index: ${this.editorGenFolder}/index.ts`);
        const editorIndexGenFile = FileUtil.pretty(editorIndexTemplate.generateGenIndex(this.language, editDef, allExtraClassifiers), "Editor Gen Index", generationStatus);
        fs.writeFileSync(`${this.editorGenFolder}/index.ts`, editorIndexGenFile);

        LOGGER.log(`Generating editor index: ${this.editorFolder}/index.ts`);
        const editorIndexFile = FileUtil.pretty(editorIndexTemplate.generateIndex(this.language, editDef), "Editor Index", generationStatus);
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
        FileUtil.deleteDirAndContent(this.editorGenFolder);
        if (force) {
            FileUtil.deleteFile(`${this.stylesFolder}/styles.ts`);
            FileUtil.deleteFile(`${this.editorFolder}/index.ts`);
            FileUtil.deleteDirIfEmpty(this.stylesFolder);
            if (this.language == null) {
                LOG2USER.error("Cannot remove all files because language is not set.");
            } else {
                FileUtil.deleteFile(`${this.editorFolder}/${Names.customActions(this.language)}.ts`);
                FileUtil.deleteFile(`${this.editorFolder}/${Names.customProjection(this.language)}.ts`);
                FileUtil.deleteDirIfEmpty(this.editorFolder);
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
