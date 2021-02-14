import { LanguageParser } from "../../../languagedef/parser/LanguageParser";
import { PiLanguage } from "../../../languagedef/metalanguage";
import { LanguageGenerator } from "../../../languagedef/generator/LanguageGenerator";

describe("Checking generator for language definition", () => {
    const testdir = "src/test/__tests__/language-tests/correctDefFiles/internal-structure/";
    const outputdir = "src/test/__tests__/language-tests/correctDefFiles/internal-structure/output";
    const dirWithCorrectOutput = "src/test/__tests__/language-tests/correctDefFiles/internal-structure/correct-output";

    test.skip("generation of all kinds of properties", () => {
        const parser = new LanguageParser();
        const generator = new LanguageGenerator();
        const parseFile = testdir + "test2.ast";
        let model: PiLanguage;
        try {
            model = parser.parse(parseFile);
            generator.outputfolder = outputdir;
            generator.generate(model);
            // TODO remove generated files, because there are errors in import statements
        } catch (e) {
            // this is a real error
            console.log("Error in test generate language: " + e.message);
        }
    });
});
