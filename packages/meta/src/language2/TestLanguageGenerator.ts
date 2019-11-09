import { parsePiLanguage } from "./LanguageParser";
import { LanguageGenerator } from "./LanguageGenerator";
import { PiLanguageDef } from "./PiLanguageDef";
import * as fs from "fs";

var languageFileName = "LanguageDefinition.lang";
if (process.argv.length > 2) {
    languageFileName = process.argv[2];
}

console.log("Reading language definition from '" + languageFileName + "'");

if( !fs.existsSync(languageFileName)) {
    console.log("Language definition file '" + languageFileName + "' does not exist, exiting.");
    process.exit(-1);
}

const langSpec: string = fs.readFileSync(languageFileName, { encoding: "UTF8" });
const model = parsePiLanguage(langSpec);

if (typeof model === "string") {
    console.log("Error parsing language specification");
    console.log(model);
} else {
    const generator = new LanguageGenerator("output");
    generator.generate(model as PiLanguageDef);
}
