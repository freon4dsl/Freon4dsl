import { ScoperDefinition } from "../../metalanguage/scoper/ScoperDefinition";
import { Helpers } from "../Helpers";
import { PiLanguage } from "../../metalanguage/PiLanguage";
import * as fs from "fs";
import { SCOPER_FOLDER } from "../GeneratorConstants";

export class ScoperGenerator {
    public outputfolder: string = ".";
    public language: PiLanguage;

    constructor() {    }

    generate(scoper: ScoperDefinition): void {
        console.log("start scoper generator: not yet implemented")
    }
}
