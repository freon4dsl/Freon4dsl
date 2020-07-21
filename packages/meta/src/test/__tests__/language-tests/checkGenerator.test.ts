import { LanguageParser } from "../../../languagedef/parser/LanguageParser";
import { PiLanguage } from "../../../languagedef/metalanguage";
import { LanguageGenerator } from "../../../languagedef/generator/LanguageGenerator";

describe("Checking generator for language definition", () => {
    let testdir = "src/test/__tests__/language-tests/correctDefFiles/internal-structure/";
    let outputdir = "src/test/__tests__/language-tests/correctDefFiles/internal-structure/output";
    let dirWithCorrectOutput = "src/test/__tests__/language-tests/correctDefFiles/internal-structure/correct-output";

    test.skip("generation of all kinds of properties", () => {
        let parser = new LanguageParser();
        let generator = new LanguageGenerator();
        let parseFile = testdir + "test2.lang";
        let model : PiLanguage;
        try {
            model = parser.parse(parseFile);
            generator.outputfolder = outputdir;
            generator.generate(model);
            // TODO remove generated files, because there are errors in import statements
        } catch(e) {
            // this is a real error
            console.log("Error in test generate language: " + e.message);
        }
    });
});
