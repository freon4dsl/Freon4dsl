import * as fs from "fs";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { Helpers, Names, TYPER_FOLDER, TYPER_GEN_FOLDER } from "../../utils";
import { AppTemplate } from "./templates/AppTemplate";

const LOGGER = new PiLogger("WebappGenerator"); // .mute();
export class WebappGenerator {
    public outputfolder: string = ".";
    // protected typerGenFolder: string;
    // protected typerFolder: string;

    generate(): void {
        // this.typerFolder = this.outputfolder + "/" + TYPER_FOLDER;
        // this.typerGenFolder = this.outputfolder + "/" + TYPER_GEN_FOLDER;
        // LOGGER.log("Generating web application in folder " + this.typerGenFolder);

        // const appTemplate = new AppTemplate();

        // //Prepare folders
        // Helpers.createDirIfNotExisting(this.typerFolder);
        // Helpers.createDirIfNotExisting(this.typerGenFolder);
        // Helpers.deleteFilesInDir(this.typerGenFolder);

        // // set relative path to get the imports right
        // let relativePath = "../../";

        // //  Generate typer
        // LOGGER.log("Generating typer class");
        // var typerFile = Helpers.pretty(appTemplate.generateTyper(this.language, typerdef, relativePath), "Typer Class");
        // fs.writeFileSync(`${this.typerGenFolder}/${Names.typer(this.language)}.ts`, typerFile);

        LOGGER.log("Succesfully generated webapp");
    } 
}
