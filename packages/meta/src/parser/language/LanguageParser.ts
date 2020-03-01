import * as fs from "fs";
import { PiLanguage } from "../../metalanguage/PiLanguage";
import { PiLanguageChecker } from "../../metalanguage/PiLanguageChecker";
let parser = require("./LanguageGrammar");

export class LanguageParser {
    parse(languageFile: string): PiLanguage {
        // Check language file
        if (!fs.existsSync(languageFile)) {
            console.log("Language definition file '" + languageFile + "' does not exist, exiting.");
            process.exit(-1);
        }
        console.log("Language file is [" + languageFile + "] ");
        const langSpec: string = fs.readFileSync(languageFile, { encoding: "UTF8" });
        // Parse Language file
        let model = null;
        try {
            model = parser.parse(langSpec);
        } catch (e) {
            console.log("Exception in Language Parser " + e);
            console.log(JSON.stringify(e, null, 4));
            console.log("Location " + e.location.line + " col " + e.location.column);
            process.exit(-1);
        }
        if (model instanceof PiLanguage) {
            const checker = new PiLanguageChecker();
            console.log("checking language");
            checker.checkLanguage(model);
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
