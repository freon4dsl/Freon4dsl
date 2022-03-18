import fs from "fs";
import { LOG2USER } from "../../utils/UserLogger";
import { PiLanguage } from "../../languagedef/metalanguage";
import { PiTyperDef } from "../new-metalanguage";
import { PiTyperReader } from "./PiTyperReader";
import { NewPiTyperChecker } from "./NewPiTyperChecker";
import { PiTypeDefinition } from "../metalanguage";
import { Checker } from "../../utils";
import { rowStyle } from "@projectit/playground/dist/example/editor/styles/CustomStyles";

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
            LOG2USER.error("definition file '" + filePath + "' does not exist, exiting.");
            throw new Error("definition file '" + filePath + "' does not exist, exiting.");
        }
        const languageStr: string = fs.readFileSync(filePath, { encoding: "utf8" });
        const typeDefinition: PiTyperDef = this.reader.readFromString(languageStr, filePath) as PiTyperDef;
        if (!!typeDefinition) {
            this.runChecker(typeDefinition);
            return typeDefinition;
        }
        return null;
    }

    parseMulti(filePaths: string[]): PiTyperDef {
        let submodels: PiTyperDef[] = [];

        // read the files and parse them separately
        for (const file of filePaths) {
            if (!fs.existsSync(file)) {
                LOG2USER.error("definition file '" + file + "' does not exist, exiting.");
                throw new Error("definition file '" + file + "' does not exist, exiting.");
            }
            try {
                const languageStr: string = fs.readFileSync(file, { encoding: "utf8" });
                const typeDefinition: PiTyperDef = this.reader.readFromString(languageStr, file) as PiTyperDef;
                if (!!typeDefinition) {
                    submodels.push(typeDefinition);
                }
            } catch (e) {
                throw new Error("In file " + file + ": " + e.message);
            }
        }

        // combine the submodels into one
        const model: PiTyperDef = this.merge(submodels);

        // run the checker on the complete model
        this.runChecker(model);

        // return the model
        return model;
    }

    private runChecker(model: PiTyperDef) {
        if (model !== null) {
            this.checker.check(model);
            // TODO check whether this is still the case:
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

    private merge(submodels: PiTyperDef[]) {
        if (submodels.length > 0) {
            let result: PiTyperDef = submodels[0];
            submodels.forEach((sub, index) => {
                if (index > 0) {
                    result.__types_references.push(...sub.__types_references);
                    result.__conceptsWithType_references.push(...sub.__conceptsWithType_references);
                    if (!!sub.anyTypeRule) {
                        if (!result.anyTypeRule) {
                            result.anyTypeRule = sub.anyTypeRule;
                        } else {
                            this.checker.errors.push(`Found a second anytype rule in ${Checker.location(sub.anyTypeRule)}, the first one is in ${Checker.location(result.anyTypeRule)}.`)
                        }
                    }
                    result.classifierRules.push(...sub.classifierRules);
                }
            });
            return result;
        } else {
            return null;
        }
    }
}
