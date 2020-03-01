import * as fs from "fs";
import { Checker } from "../metalanguage/Checker";
import { PiLanguage } from "../metalanguage/PiLanguage";
import { PiLanguageChecker } from "../metalanguage/PiLanguageChecker";

let parser = require("./LanguageGrammar");

export class Parser<LANGUAGE> {
    parse(languageFile: string, parser: Function, checker: Checker<LANGUAGE>, msg: string): LANGUAGE {
        // Check language file
        if (!fs.existsSync(languageFile)) {
            console.log(msg + " definition file '" + languageFile + "' does not exist, exiting.");
            process.exit(-1);
        }
        console.log(msg + " file is [" + languageFile + "] ");
        const langSpec: string = fs.readFileSync(languageFile, { encoding: "UTF8" });
        // Parse Language file
        let model: LANGUAGE = null;
        try {
            model = parser.apply(langSpec);
            // model = parser.parse(langSpec);
        } catch (e) {
            console.log("Exception in " + msg + " Parser " + e);
            console.log(JSON.stringify(e, null, 4));
            console.log("Location " + e.location.line + " col " + e.location.column);
            process.exit(-1);
        }
        if (model !== null) {
            console.log("cecking language");
            checker.check(model);
            checker.errors.forEach(error => console.log("ERROR: " + error));
            if (checker.hasErrors()) {
                console.log("Stopping because of errors.");
                process.exit(-1);
            }
            return model;
        } else {
            console.log("ERROR: Language parser does not return a PiLanguage");
            process.exit(-1);
        }
    }
}
