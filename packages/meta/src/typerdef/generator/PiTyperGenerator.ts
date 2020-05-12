import * as fs from "fs";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLanguageUnit } from "../../languagedef/metalanguage";
import { PiTypeDefinition } from "../metalanguage";
import { Helpers, Names, TYPER_FOLDER, TYPER_GEN_FOLDER } from "../../utils";
import { PiTyperTemplate } from "./templates/PiTyperTemplate";

const LOGGER = new PiLogger("PiTyperGenerator"); //.mute();
export class PiTyperGenerator {
    public outputfolder: string = ".";
    public language: PiLanguageUnit;
    protected typerGenFolder: string;
    protected typerFolder: string;

    constructor(language: PiLanguageUnit) {
        this.language = language;
    }

    generate(typerdef: PiTypeDefinition): void {
        let numberOfErrors = 0;
        this.typerFolder = this.outputfolder + "/" + TYPER_FOLDER;
        this.typerGenFolder = this.outputfolder + "/" + TYPER_GEN_FOLDER;
        let name = typerdef ? typerdef.name + " " : "";
        LOGGER.log("Generating typer: " + name + "in folder " + this.typerGenFolder);

        const typer = new PiTyperTemplate();

        //Prepare folders
        Helpers.createDirIfNotExisting(this.typerFolder);
        Helpers.createDirIfNotExisting(this.typerGenFolder);
        Helpers.deleteFilesInDir(this.typerGenFolder, numberOfErrors);

        // set relative path to get the imports right
        let relativePath = "../../";

        //  Generate typer
        LOGGER.log(`Generating typer: ${this.typerGenFolder}/${Names.typer(this.language)}.ts`);
        var typerFile = Helpers.pretty(typer.generateTyper(this.language, typerdef, relativePath), "Typer Class", numberOfErrors);
        fs.writeFileSync(`${this.typerGenFolder}/${Names.typer(this.language)}.ts`, typerFile);

        LOGGER.log(`Generating typer gen index: ${this.typerGenFolder}/index.ts`);
        var typerIndexGenFile = Helpers.pretty(typer.generateGenIndex(this.language), "Typer Gen Index", numberOfErrors);
        fs.writeFileSync(`${this.typerGenFolder}/index.ts`, typerIndexGenFile);

        if (numberOfErrors > 0) {
            LOGGER.info(this, `Generated typer '${name}' with ${numberOfErrors} errors.`);
        } else {
            LOGGER.info(this, `Succesfully generated typer ${name}`);
        }
    }
}
