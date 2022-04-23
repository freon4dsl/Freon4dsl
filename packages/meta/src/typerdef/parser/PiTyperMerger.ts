import fs from "fs";
import { LOG2USER } from "../../utils/UserLogger";
import { PiLanguage } from "../../languagedef/metalanguage";
import { PiTyperDef } from "../metalanguage";
import { PiTyperReader } from "./PiTyperReader";
import { PiTyperCheckerPhase1 } from "./PiTyperCheckerPhase1";
import { Checker } from "../../utils";
import { PiTyperChecker } from "./PiTyperChecker";
import { ParseLocationUtil } from "../../utils/parsingAndChecking/ParseLocationUtil";

/**
 * This class parses one of more .type files and merges them into a single PiTyperDef object, which is then
 * checker by the PiTyperCheckerPhase1.
 */
export class PiTyperMerger {
    public language: PiLanguage;
    public checker: PiTyperChecker;
    private reader: PiTyperReader;

    constructor(language: PiLanguage) {
        this.language = language;
        this.checker = new PiTyperChecker(language);
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
                console.log(e.stack);
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
                    result.__types.push(...sub.__types);
                    result.typeConcepts.push(...sub.typeConcepts);
                    result.__conceptsWithType.push(...sub.__conceptsWithType);
                    if (!!sub.anyTypeSpec) {
                        if (!result.anyTypeSpec) {
                            result.anyTypeSpec = sub.anyTypeSpec;
                        } else {
                            this.checker.errors.push(`Found a second anytype rule in ${ParseLocationUtil.location(sub.anyTypeSpec)}, the first one is in ${ParseLocationUtil.location(result.anyTypeSpec)}.`)
                        }
                    }
                    result.classifierSpecs.push(...sub.classifierSpecs);
                }
            });
            return result;
        } else {
            return null;
        }
    }
}
