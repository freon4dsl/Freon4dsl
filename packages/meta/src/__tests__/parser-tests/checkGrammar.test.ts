import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { FreLanguage } from "../../languagedef/metalanguage";
import { FileUtil, MetaLogger } from "../../utils";
import { ReaderWriterGenerator } from "../../parsergen/ReaderWriterGenerator";
import { PiEditParser } from "../../editordef/parser/PiEditParser";
import * as fs from "fs";
import { PiEditUnit } from "../../editordef/metalanguage";

/* These incomplete tests only test whether the generated grammar is equal
to the previously generated grammar. A true test of the parser must be
done in the test package.
 */

describe("Checking parser generation", () => {
    const testdir = "src/__tests__/parser-tests/correctDefFiles/";
    const outputDir = "src/__tests__/parser-tests/generated/"
    let language: FreLanguage;
    MetaLogger.muteAllLogs();
    MetaLogger.muteAllErrors();

    afterAll(() => {
        // TODO make recursive version of deleteDirAndContent
        FileUtil.deleteDirAndContent(outputDir + "reader/gen/");
        FileUtil.deleteDirAndContent(outputDir + "writer/gen/");
        FileUtil.deleteDirAndContent(outputDir + "reader/");
        FileUtil.deleteDirAndContent(outputDir + "writer/");
        FileUtil.deleteDirAndContent(outputDir);
    });

    test("on primitives", () => {
        const langParser = new LanguageParser();
        try {
            language = langParser.parse(testdir + "test1.ast");
        } catch (e) {
            console.log("Language could not be read: " + e.message);
            console.log(langParser.checker.errors.map(e => e).join("\n"));
        }
        if (!!language) {
            const editor = new PiEditParser(language).parse(testdir + "test1.edit");
            const generator = new ReaderWriterGenerator();
            generator.language = language;
            generator.outputfolder = outputDir;
            generator.generate(editor);
            const grammarFile = outputDir + "reader/gen/Test1Grammar.ts";
            const isPresent: boolean = fs.existsSync(grammarFile);
            expect(isPresent).toBe(true);
            if (isPresent) {
                const result = fs.readFileSync(grammarFile);
                expect(result).toMatchSnapshot();
            }
        }
    });

    test("on single properties", () => {
        const langParser = new LanguageParser();
        try {
            language = langParser.parse(testdir + "test2.ast");
        } catch (e) {
            console.log("Language could not be read: " + e.message);
            console.log(langParser.checker.errors.map(e => e).join("\n"));
        }
        if (!!language) {
            const editParser = new PiEditParser(language);
            let editor: PiEditUnit = null;
            try {
                editor = editParser.parse(testdir + "test2.edit");

            } catch (e) {
                console.log("Edit definition could not be read: " + e.message);
                console.log(editParser.checker.errors.map(e => e).join("\n"));
            }
            if (!!editor) {
                const generator = new ReaderWriterGenerator();
                generator.language = language;
                generator.outputfolder = outputDir;
                generator.generate(editor);
                const grammarFile = outputDir + "reader/gen/Test2Grammar.ts";
                const isPresent: boolean = fs.existsSync(grammarFile);
                expect(isPresent).toBe(true);
                if (isPresent) {
                    const result = fs.readFileSync(grammarFile);
                    expect(result).toMatchSnapshot();
                }
            }
        }
    });

    test("on list properties", () => {
        const langParser = new LanguageParser();
        try {
            language = langParser.parse(testdir + "test3.ast");
        } catch (e) {
            console.log("Language could not be read: " + e.message);
            console.log(langParser.checker.errors.map(e => e).join("\n"));
        }
        if (!!language) {
            const editParser = new PiEditParser(language);
            let editor: PiEditUnit = null;
            try {
                editor = editParser.parse(testdir + "test3.edit");

            } catch (e) {
                console.log("Edit definition could not be read: " + e.message);
                console.log(editParser.checker.errors.map(e => e).join("\n"));
            }
            if (!!editor) {
                const generator = new ReaderWriterGenerator();
                generator.language = language;
                generator.outputfolder = outputDir;
                generator.generate(editor);
                const grammarFile = outputDir + "reader/gen/Test2Grammar.ts";
                const isPresent: boolean = fs.existsSync(grammarFile);
                expect(isPresent).toBe(true);
                if (isPresent) {
                    const result = fs.readFileSync(grammarFile);
                    expect(result).toMatchSnapshot();
                }
            }
        }
    });

    test("on abstract concepts and interfaces", () => {
        const langParser = new LanguageParser();
        try {
            language = langParser.parse(testdir + "test4.ast");
        } catch (e) {
            console.log("Language could not be read: " + e.message);
            console.log(langParser.checker.errors.map(e => e).join("\n"));
        }
        if (!!language) {
            const editParser = new PiEditParser(language);
            let editor: PiEditUnit = null;
            try {
                editor = editParser.parse(testdir + "test4.edit");

            } catch (e) {
                console.log("Edit definition could not be read: " + e.message);
                console.log(editParser.checker.errors.map(e => e).join("\n"));
            }
            if (!!editor) {
                const generator = new ReaderWriterGenerator();
                generator.language = language;
                generator.outputfolder = outputDir;
                generator.generate(editor);
                const grammarFile = outputDir + "reader/gen/Test4Grammar.ts";
                const isPresent: boolean = fs.existsSync(grammarFile);
                expect(isPresent).toBe(true);
                if (isPresent) {
                    const result = fs.readFileSync(grammarFile);
                    expect(result).toMatchSnapshot();
                }
            }
            // TODO should projections for interfaces be taken into account??
        }
    });

});
