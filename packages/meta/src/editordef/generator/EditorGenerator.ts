import * as fs from "fs";
import { ListUtil, MetaLogger } from "../../utils/no-dependencies/index.js";
import {
    FreMetaClassifier,
    FreMetaConcept,
    FreMetaLanguage,
    FreMetaLimitedConcept,
} from "../../languagedef/metalanguage/index.js";
import {
    EDITOR_FOLDER,
    Names
} from "../../utils/on-lang/index.js";
import {
    GenerationStatus,
    FileUtil,
    isNullOrUndefined
} from "../../utils/file-utils/index.js";
import { FreEditUnit } from "../metalanguage/index.js";
import { ActionsTemplate, EditorIndexTemplate, BoxProviderTemplate } from "./templates/index.js";
import { CustomActionsTemplate, CustomProjectionTemplate, DefaultActionsTemplate } from "./templates/index.js";
import { EditorDefTemplate } from "./templates/index.js";
import { NamesForEditor } from '../../utils/on-lang-and-editor/index.js';

const LOGGER = new MetaLogger("EditorGenerator").mute();

export class EditorGenerator {
    public outputfolder: string = ".";
    public customsfolder: string = ".";
    protected editorFolder: string = "";
    language?: FreMetaLanguage;

    generate(editDef: FreEditUnit): void {
        if (this.language === null || this.language === undefined) {
            LOGGER.error("Cannot generate editor because language is not set.");
            return;
        }
        if (isNullOrUndefined(editDef)) {
            LOGGER.error("Cannot generate editor because editor definition is null or undefined.");
            return;
        }

        this.getFolderNames();
        LOGGER.log("Generating editor in folder " + this.editorFolder + " for language " + this.language?.name);

        const generationStatus: GenerationStatus = new GenerationStatus();
        const defaultActions: DefaultActionsTemplate = new DefaultActionsTemplate();
        const customActions: CustomActionsTemplate = new CustomActionsTemplate();
        const actions: ActionsTemplate = new ActionsTemplate();
        const projection: BoxProviderTemplate = new BoxProviderTemplate(editDef);
        const customProjectiontemplate: CustomProjectionTemplate = new CustomProjectionTemplate();
        const editorIndexTemplate: EditorIndexTemplate = new EditorIndexTemplate();
        // const stylesTemplate = new StylesTemplate();
        const editorDefTemplate: EditorDefTemplate = new EditorDefTemplate();

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.outputfolder + this.customsfolder); // will not be overwritten
        FileUtil.createDirIfNotExisting(this.editorFolder);
        FileUtil.deleteFilesInDir(this.editorFolder, generationStatus);

        // Set relative path to get the imports right
        const relativePath = "..";

        // During generation, we may conclude that extra box providers classes need to be generated.
        // We keep the classifiers for which this is necessary in the list 'extraClassifiers'.
        let extraClassifiers: FreMetaClassifier[] = [];
        this.language.concepts.forEach((concept) => {
            if (!(concept instanceof FreMetaLimitedConcept) && !concept.isAbstract) {
                const projectionfile = FileUtil.pretty(
                    projection.generateBoxProvider(this.language!, concept, editDef, extraClassifiers, relativePath),
                    "Box provider " + concept.name,
                    generationStatus,
                );
                fs.writeFileSync(`${this.editorFolder}/${NamesForEditor.boxProvider(concept)}.ts`, projectionfile);
            }
        });

        this.language.units.forEach((concept) => {
            const projectionfile = FileUtil.pretty(
                projection.generateBoxProvider(this.language!, concept, editDef, extraClassifiers, relativePath),
                "Box provider " + concept.name,
                generationStatus,
            );
            fs.writeFileSync(`${this.editorFolder}/${NamesForEditor.boxProvider(concept)}.ts`, projectionfile);
        });

        const allExtraClassifiers: FreMetaClassifier[] = []; // remember these in order to add them to the index file
        ListUtil.addListIfNotPresent(allExtraClassifiers, extraClassifiers);
        while (extraClassifiers.length > 0) {
            // super projections may call other super projections, make sure every one has a BoxProvider
            const newExtraClassifiers: FreMetaClassifier[] = [];
            extraClassifiers.forEach((cls) => {
                if (cls instanceof FreMetaConcept && !cls.isAbstract) {
                    // do nothing, already generated
                } else {
                    const projectionfile = FileUtil.pretty(
                        projection.generateBoxProvider(this.language!, cls, editDef, newExtraClassifiers, relativePath),
                        "Box provider " + cls.name,
                        generationStatus,
                    );
                    fs.writeFileSync(`${this.editorFolder}/${NamesForEditor.boxProvider(cls)}.ts`, projectionfile);
                }
            });
            extraClassifiers = newExtraClassifiers;
            ListUtil.addListIfNotPresent(allExtraClassifiers, extraClassifiers);
        }

        // Generate the actions
        LOGGER.log(`Generating actions default: ${this.editorFolder}/${Names.defaultActions(this.language!)}.ts`);
        const defaultActionsFile = FileUtil.pretty(
            defaultActions.generate(this.language!, editDef, relativePath),
            "DefaultActions",
            generationStatus,
        );
        fs.writeFileSync(`${this.editorFolder}/${Names.defaultActions(this.language!)}.ts`, defaultActionsFile);

        LOGGER.log(`Generating editor language definition: ${this.editorFolder}/EditorDef.ts`);
        const editorDefFile = FileUtil.pretty(
            editorDefTemplate.generateEditorDef(this.language!, editDef, this.customsfolder, relativePath),
            "Editor Definition",
            generationStatus,
        );
        fs.writeFileSync(`${this.editorFolder}/EditorDef.ts`, editorDefFile);

        // the following do not need the relativePath for imports
        LOGGER.log(`Generating actions: ${this.editorFolder}/${Names.actions(this.language!)}.ts`);
        const actionsFile = FileUtil.pretty(actions.generate(this.language!, this.customsfolder, relativePath), "Actions", generationStatus);
        fs.writeFileSync(`${this.editorFolder}/${Names.actions(this.language!)}.ts`, actionsFile);

        LOGGER.log(`Generating custom actions: ${this.outputfolder + this.customsfolder}${Names.customActions(this.language!)}.ts`);
        const customActionsFile = FileUtil.pretty(
            customActions.generate(this.language!),
            "CustomActions",
            generationStatus,
        );
        FileUtil.generateManualFile(
            `${this.outputfolder + this.customsfolder}/${Names.customActions(this.language!)}.ts`,
            customActionsFile,
            "CustomActions",
        );

        LOGGER.log(`Generating custom projection: ${this.outputfolder + this.customsfolder}${Names.customProjection(this.language!)}.ts`);
        const customProjectionFile = FileUtil.pretty(
            customProjectiontemplate.generate(this.language!),
            "Custom Projection",
            generationStatus,
        );
        FileUtil.generateManualFile(
            `${this.outputfolder + this.customsfolder}/${Names.customProjection(this.language!)}.ts`,
            customProjectionFile,
            "Custom Projection",
        );

        LOGGER.log(`Generating editor gen index: ${this.editorFolder}/index.ts`);
        const editorIndexGenFile = FileUtil.pretty(
            editorIndexTemplate.generateGenIndex(this.language!, allExtraClassifiers),
            "Editor Gen Index",
            generationStatus,
        );
        fs.writeFileSync(`${this.editorFolder}/index.ts`, editorIndexGenFile);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(`Generated editor with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Successfully generated editor`);
        }
    }

    private getFolderNames() {
        this.editorFolder = this.outputfolder + "/" + EDITOR_FOLDER;
    }
}
