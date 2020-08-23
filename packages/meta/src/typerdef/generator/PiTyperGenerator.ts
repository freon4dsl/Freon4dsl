import * as fs from "fs";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLanguage } from "../../languagedef/metalanguage";
import { PiTypeDefinition } from "../metalanguage";
import { GenerationStatus, Helpers, Names, TYPER_FOLDER, TYPER_GEN_FOLDER } from "../../utils";
import { PiTyperTemplate } from "./templates/PiTyperTemplate";

const LOGGER = new PiLogger("PiTyperGenerator"); // .mute();
export class PiTyperGenerator {
    public outputfolder: string = ".";
    public language: PiLanguage;
    protected typerGenFolder: string;
    protected typerFolder: string;

    constructor(language: PiLanguage) {
        this.language = language;
    }

    generate(typerdef: PiTypeDefinition): void {
        const generationStatus = new GenerationStatus();
        this.typerFolder = this.outputfolder + "/" + TYPER_FOLDER;
        this.typerGenFolder = this.outputfolder + "/" + TYPER_GEN_FOLDER;
        const name = typerdef ? typerdef.name + " " : "";
        LOGGER.log("Generating typer: " + name + "in folder " + this.typerGenFolder);

        const typer = new PiTyperTemplate();

        // Prepare folders
        Helpers.createDirIfNotExisting(this.typerFolder);
        Helpers.createDirIfNotExisting(this.typerGenFolder);
        Helpers.deleteFilesInDir(this.typerGenFolder, generationStatus);

        // set relative path to get the imports right
        const relativePath = "../../";

        //  Generate typer
        LOGGER.log(`Generating typer: ${this.typerGenFolder}/${Names.typer(this.language)}.ts`);
        const typerFile = Helpers.pretty(typer.generateTyper(this.language, typerdef, relativePath), "Typer Class", generationStatus);
        fs.writeFileSync(`${this.typerGenFolder}/${Names.typer(this.language)}.ts`, typerFile);

        LOGGER.log(`Generating typer gen index: ${this.typerGenFolder}/index.ts`);
        const typerIndexGenFile = Helpers.pretty(typer.generateGenIndex(this.language), "Typer Gen Index", generationStatus);
        fs.writeFileSync(`${this.typerGenFolder}/index.ts`, typerIndexGenFile);

        if (generationStatus.numberOfErrors > 0) {
            LOGGER.info(this, `Generated typer '${name}' with ${generationStatus.numberOfErrors} errors.`);
        } else {
            LOGGER.info(this, `Succesfully generated typer ${name}`);
        }
    }
}
