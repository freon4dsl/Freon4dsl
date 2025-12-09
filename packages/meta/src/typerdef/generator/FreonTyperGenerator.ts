import * as fs from "fs";
import type { FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import type { TyperDef } from "../metalanguage/index.js";
import {
    Names,
    TYPER_FOLDER,
    TYPER_CONCEPTS_FOLDER,
} from "../../utils/on-lang/index.js";
import { FreTyperTemplate } from "./templates/FreTyperTemplate.js";
import { FreTyperPartTemplate } from "./templates/FreTyperPartTemplate.js";
import { FreCustomTyperPartTemplate } from "./templates/FreCustomTyperPartTemplate.js";
import { FreTypeConceptMaker } from "./templates/FreTypeConceptMaker.js";
import { TyperDefTemplate } from "./templates/TyperDefTemplate.js";
import { MetaLogger } from '../../utils/no-dependencies/index.js';
import { FileUtil, GenerationStatus } from "../../utils/file-utils/index.js";

const LOGGER = new MetaLogger("FreonTyperGenerator");

/**
 * This class generates the implementation for a typer definition.
 * It generates a set of files in a number of folders.
 */
export class FreonTyperGenerator {
    public outputFolder: string = ".";
    public customsFolder: string = ".";
    public language: FreMetaLanguage | undefined;
    protected typerConceptsFolder: string = "";
    protected typerFolder: string = "";

    generate(typerdef: TyperDef | undefined): void {
        if (this.language === undefined || this.language === null) {
            LOGGER.error("Cannot generate typer because language is not set.");
            return;
        }
        const generationStatus = new GenerationStatus();
        this.getFolderNames();
        LOGGER.log("Generating typer in folder " + this.typerFolder);

        const typer: FreTyperTemplate = new FreTyperTemplate();
        const typerDef: TyperDefTemplate = new TyperDefTemplate();
        const typeConceptMaker: FreTypeConceptMaker = new FreTypeConceptMaker();
        const customPart: FreCustomTyperPartTemplate = new FreCustomTyperPartTemplate();
        const typerPart: FreTyperPartTemplate = new FreTyperPartTemplate();

        // Prepare folders
        FileUtil.createDirIfNotExisting(this.outputFolder + "/" + this.customsFolder); // will not be overwritten
        FileUtil.createDirIfNotExisting(this.typerFolder);
        // Note that the creation of the concepts folder must follow the deletion of
        // files in the typer folder, because the concepts folder is part of the typer folder.
        // TODO find more elegant manner
        FileUtil.createDirIfNotExisting(this.typerConceptsFolder);
        FileUtil.deleteFilesInDir(this.typerConceptsFolder, generationStatus);
        // TODO re-introduce deletion of files => take care of correct order of deletion
        FileUtil.deleteFilesInDir(this.typerFolder, generationStatus);

        // set relative path to get the imports right
        let relativePath: string = "../..";

        //  Generate typer
        if (!!typerdef && typerdef.typeConcepts.length > 0) {
            typerdef.typeConcepts.forEach((con) => {
                LOGGER.log(`Generating type concept: ${this.typerConceptsFolder}/${Names.classifier(con)}.ts`);
                // @ts-ignore TS2322
                con.language = this.language;
                const typeConceptFile = FileUtil.pretty(
                    typeConceptMaker.generateTypeConcept(con, relativePath),
                    "Type Concept",
                    generationStatus,
                );
                fs.writeFileSync(`${this.typerConceptsFolder}/${Names.classifier(con)}.ts`, typeConceptFile);
            });

            LOGGER.log(`Generating type concept index: ${this.typerConceptsFolder}/index.ts`);
            const typeConceptIndexFile = FileUtil.pretty(
                typeConceptMaker.makeIndexFile(typerdef),
                "Type Concept Index",
                generationStatus,
            );
            fs.writeFileSync(`${this.typerConceptsFolder}/index.ts`, typeConceptIndexFile);

            LOGGER.log(`Generating type concept index: ${this.typerConceptsFolder}/internal.ts`);
            const typeConceptInternalFile = FileUtil.pretty(
                typeConceptMaker.makeInternalFile(typerdef),
                "Type Concept Internal",
                generationStatus,
            );
            fs.writeFileSync(`${this.typerConceptsFolder}/internal.ts`, typeConceptInternalFile);
        }

        relativePath = "..";

        LOGGER.log(`Generating typerPart: ${this.typerFolder}/${Names.typerPart(this.language)}.ts`);
        const checkerFile: string = FileUtil.pretty(
            typerPart.generateTyperPart(this.language, typerdef, relativePath),
            "TyperPart Class",
            generationStatus,
        );
        fs.writeFileSync(`${this.typerFolder}/${Names.typerPart(this.language)}.ts`, checkerFile);

        LOGGER.log(`Generating typer gen index: ${this.typerFolder}/index.ts`);
        const typerIndexGenFile = FileUtil.pretty(
            typer.generateGenIndex(this.language),
            "Typer Gen Index",
            generationStatus,
        );
        fs.writeFileSync(`${this.typerFolder}/index.ts`, typerIndexGenFile);

        LOGGER.log(`Generating typer init: ${this.typerFolder}/${Names.typerDef(this.language)}.ts`);
        const typerDefFile = FileUtil.pretty(
            typerDef.generateTyperDef(this.language, this.customsFolder, relativePath),
            "Typer Init",
            generationStatus,
        );
        fs.writeFileSync(`${this.typerFolder}/${Names.typerDef(this.language)}.ts`, typerDefFile);

        // change relative path to get the imports right
        relativePath = "..";

        LOGGER.log(`Generating custom typerPart: ${this.outputFolder}/${this.customsFolder}/index.ts`);
        const customTyperFile = FileUtil.pretty(
            customPart.generateCustomTyperPart(this.language),
            "Custom TyperPart",
            generationStatus,
        );
        FileUtil.generateManualFile(
            `${this.outputFolder}/${this.customsFolder}/${Names.customTyper(this.language)}.ts`,
            customTyperFile,
            "Custom TyperPart",
        );

        LOGGER.log(`Generating typer index: ${this.typerFolder}/index.ts`);
        const typerIndexFile = FileUtil.pretty(typer.generateIndex(this.language), "Typer Index", generationStatus);
        FileUtil.generateManualFile(`${this.typerFolder}/index.ts`, typerIndexFile, "Typer Index");

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.error(`Generated typer with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(`Successfully generated typer`);
        }
    }

    private getFolderNames() {
        this.typerFolder = this.outputFolder + "/" + TYPER_FOLDER;
        this.typerConceptsFolder = this.outputFolder + "/" + TYPER_CONCEPTS_FOLDER;
    }
}
