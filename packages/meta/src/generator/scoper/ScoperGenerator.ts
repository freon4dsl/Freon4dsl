import { Helpers } from "../Helpers";
import { Names } from "../Names";
import { PiLanguage } from "../../metalanguage/PiLanguage";
import * as fs from "fs";
import { SCOPER_FOLDER } from "../GeneratorConstants";

export class ScoperGenerator {
    public outputfolder: string = ".";
    protected languageFolder: string;

    constructor() {    }

    generate(language: PiLanguage): void {
        console.log("start scoper generator")
    }
}
