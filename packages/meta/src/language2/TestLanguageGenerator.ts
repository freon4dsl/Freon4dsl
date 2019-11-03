import { parsePiLanguage } from "./LanguageParser";
import { LanguageGenerator } from "./LanguageGenerator";
import { PiLanguageDef } from "./PiLanguageDef";
import * as fs from "fs";

const langSpec: string = fs.readFileSync("DemoLanguageDefinition.pi", {encoding: "UTF8"});

const model = parsePiLanguage(langSpec); // examplePiLanguage;

if( typeof model === "string"){
    console.log("Error parsing language specification")
    console.log(model);
}else {
    // console.log(JSON.stringify(model, null, 4));
    const generator = new LanguageGenerator("output");

    generator.generate(model as PiLanguageDef);
}
