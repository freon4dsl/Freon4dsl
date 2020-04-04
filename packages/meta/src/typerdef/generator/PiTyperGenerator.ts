import * as fs from "fs";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiLanguageUnit } from "../../languagedef/metalanguage";
import { PiTypeDefinition } from "../metalanguage";
import { Helpers, Names, TYPER_FOLDER, TYPER_GEN_FOLDER } from "../../utils";
import { PiTyperTemplate } from "./templates/PiTyperTemplate";

const LOGGER = new PiLogger("PiTyperGenerator"); // .mute();
export class PiTyperGenerator {
    public outputfolder: string = ".";
    public language: PiLanguageUnit;
    protected typerGenFolder: string;
    protected typerFolder: string;

    constructor(language: PiLanguageUnit) {
        this.language = language;
    }

    generate(typerdef: PiTypeDefinition): void {
        this.typerFolder = this.outputfolder + "/" + TYPER_FOLDER;
        this.typerGenFolder = this.outputfolder + "/" + TYPER_GEN_FOLDER;
        let name = typerdef? typerdef.name + " " : "";
        LOGGER.log("Generating typer: " + name + "in folder " + this.typerGenFolder);

        const typer = new PiTyperTemplate();

        //Prepare folders
        Helpers.createDirIfNotExisting(this.typerFolder);
        Helpers.createDirIfNotExisting(this.typerGenFolder);
        Helpers.deleteFilesInDir(this.typerGenFolder);

        // set relative path to get the imports right
        let relativePath = "../../";

        //  Generate typer
        LOGGER.log("Generating typer class");
        var typerFile = Helpers.pretty(typer.generateTyper(this.language, typerdef, relativePath), "Typer Class");
        fs.writeFileSync(`${this.typerGenFolder}/${Names.typer(this.language)}.ts`, typerFile);

        LOGGER.log("Generating typer gen index");
        var typerIndexGenFile = Helpers.pretty(typer.generateGenIndex(this.language), "Typer Gen Index");
        fs.writeFileSync(`${this.typerGenFolder}/index.ts`, typerIndexGenFile);

        LOGGER.log("Succesfully generated typer: " + name);
    } 
}
