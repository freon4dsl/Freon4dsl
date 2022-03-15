import fs from "fs";
import { LOG2USER } from "../../utils/UserLogger";
import { PiLanguage } from "../../languagedef/metalanguage";
import { PiTyperDef } from "../new-metalanguage";
import { PiTyperReader } from "./PiTyperReader";
import { NewPiTyperChecker } from "./NewPiTyperChecker";
import { Checker } from "../../utils";

export class NewPiTyperParser {
    public language: PiLanguage;
    public checker: NewPiTyperChecker;
    private reader: PiTyperReader;

    constructor(language: PiLanguage) {
        this.language = language;
        this.checker = new NewPiTyperChecker(language);
        this.reader = new PiTyperReader();
    }

    parse(filePath: string): PiTyperDef {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error("File not found: " + filePath);
        }
        const languageStr: string = fs.readFileSync(filePath, { encoding: "utf8" });
        const typeDefinition: PiTyperDef = this.reader.readFromString(languageStr, filePath) as PiTyperDef;
        if (!typeDefinition) {
            throw new Error("Error in parsing type definition.");
        } else {
            // console.log(typeDefinition.classifierRules.map(r => "found rule at " + r.agl_location?.line))
            this.runChecker(typeDefinition);
            return typeDefinition;
        }
    }
    // TODO create parseMulti()

    private runChecker(model: PiTyperDef) {
        if (model !== null) {
            this.checker.check(model);
            // this.checker.check makes errorlist empty, thus we must
            // add the non fatal parse errors after the call
            // this.checker.errors.push(...this.getNonFatalParseErrors());
            if (this.checker.hasErrors()) {
                this.checker.errors.forEach(error => LOG2USER.error(`${error}`));
                throw new Error("checking errors (" + this.checker.errors.length + ").");
            }
            if (this.checker.hasWarnings()) {
                this.checker.warnings.forEach(warn => LOG2USER.warning(`Warning: ${warn}`));
            }
        } else {
            throw new Error("parser does not return a language definition.");
        }
    }

    parseMulti(filePaths: string[]): PiTyperDef {
        // for now we only read one file TODO extend this
        if (filePaths.length > 0) {
            return this.parse(filePaths[0]);
        } else {
            return null;
        }
        // let submodels: PiTyperDef[] = [];
        //
        // // read the files and parse them separately
        // for (const file of filePaths) {
        //     if (!fs.existsSync(file)) {
        //         LOG2USER.error("definition file '" + file + "' does not exist, exiting.");
        //         throw new Error("definition file '" + file + "' does not exist, exiting.");
        //     } else {
        //         const languageStr: string = fs.readFileSync(file, { encoding: "utf8" });
        //         const typeDefinition: PiTyperDef = this.reader.readFromString(languageStr, file) as PiTyperDef;
        //         if (!!typeDefinition) {
        //             submodels.push(typeDefinition);
        //         }
        //     }
        // }
        //
        // // combine the submodels into one
        // const model: PiTyperDef = this.merge(submodels);
        //
        // // run the checker
        // this.runChecker(model);
        //
        // // return the model
        // return model;
    }
}
