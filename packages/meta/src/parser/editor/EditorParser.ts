import * as fs from "fs";
import { PiLanguage } from "../../metalanguage/PiLanguage";
import { PiLanguageChecker } from "../../metalanguage/PiLanguageChecker";
let parser = require("./EditorGrammar");

export class EditorParser {
    parse(editorFile: string): PiLanguage {
        // Check language file
        if (!fs.existsSync(editorFile)) {
            console.log("Editor definition file '" + editorFile + "' does not exist, exiting.");
            process.exit(-1);
        }
        console.log("Editor file is [" + editorFile + "] ");
        const langSpec: string = fs.readFileSync(editorFile, { encoding: "UTF8" });
        // Parse Language file
        let model = null;
        try {
            model = parser.parse(langSpec);
        } catch (e) {
            console.log("Exception in Editor Parser " + e);
            console.log(JSON.stringify(e, null, 4));
            console.log("Location " + e.location.line + " col " + e.location.column);
            process.exit(-1);
        }
        if (model instanceof PiLanguage) {
            const checker = new PiLanguageChecker();
            console.log("checking editor");
            checker.check(model);
            checker.errors.forEach(error => console.log("ERROR: " + error));
            if (checker.hasErrors()) {
                console.log("Stopping because of errors.");
                process.exit(-1);
            }
            return model;
        } else {
            console.log("ERROR: Editor parser does not return a PiLanguage");
            process.exit(-1);
        }
    }
}
