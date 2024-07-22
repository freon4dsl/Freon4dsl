import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { FreMetaLanguage } from "../../languagedef/metalanguage";
import { FileUtil, MetaLogger } from "../../utils";
import { ReaderWriterGenerator } from "../../parsergen/ReaderWriterGenerator";
import { FreEditParser } from "../../editordef/parser/FreEditParser";
import * as fs from "fs";
import { FreEditUnit } from "../../editordef/metalanguage";

/* These incomplete tests only test whether the generated grammar is equal
to the previously generated grammar. A true test of the parser must be
done in the test package.
 */

describe("Checking parser generation", () => {
    const testdir = "src/__tests__/parser-tests/correctDefFiles/";
    const outputDir = "src/__tests__/parser-tests/generated/";
    let language: FreMetaLanguage | undefined;
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
        const langParser: LanguageParser = new LanguageParser();
        try {
            language = langParser.parse(testdir + "test1.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log("Language could not be read: " + e.message);
                console.log(langParser.checker.errors.map(e => e).join("\n"));
            }
        }
        expect(language).not.toBeNull();
        expect(language).not.toBeUndefined();
        if (!!language) {
            // console.log("Parsed language: " + language.name);
            const editor: FreEditUnit | undefined = new FreEditParser(language).parse(testdir + "test1.edit");
            expect(editor).not.toBeNull();
            expect(editor).not.toBeUndefined();
            // console.log("Parsed editor: ");
            const generator = new ReaderWriterGenerator();
            generator.language = language;
            generator.outputfolder = outputDir;
            generator.generate(editor!);
            const grammarFile = outputDir + "reader/gen/TEST1Grammar.ts";
            const isPresent: boolean = fs.existsSync(grammarFile);
            expect(isPresent).toBe(true);
            if (isPresent) {
                const result = fs.readFileSync(grammarFile, "utf8");
                expect(result).toMatchSnapshot();
            }
        }
    });

    test("on single properties", () => {
        const langParser = new LanguageParser();
        try {
            language = langParser.parse(testdir + "test2.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log("Language could not be read: " + e.message);
                console.log(langParser.checker.errors.map(e => e).join("\n"));
            }
        }
        expect(language).not.toBeNull();
        expect(language).not.toBeUndefined();
        if (!!language) {
            const editParser: FreEditParser | undefined = new FreEditParser(language);
            let editor: FreEditUnit | undefined = undefined;
            try {
                editor = editParser.parse(testdir + "test2.edit");

            } catch (e: unknown) {
                if (e instanceof Error) {
                    console.log("Edit definition could not be read: " + e.message);
                    console.log(editParser.checker.errors.map(e => e).join("\n"));
                }
            }
            if (!!editor) {
                const generator = new ReaderWriterGenerator();
                generator.language = language;
                generator.outputfolder = outputDir;
                generator.generate(editor);
                const grammarFile = outputDir + "reader/gen/TEST2Grammar.ts";
                const isPresent: boolean = fs.existsSync(grammarFile);
                expect(isPresent).toBe(true);
                if (isPresent) {
                    const result = fs.readFileSync(grammarFile, "utf8");
                    expect(result).toMatchSnapshot();
                }
            }
        }
    });

    test("on list properties", () => {
        const langParser: LanguageParser = new LanguageParser();
        try {
            language = langParser.parse(testdir + "test3.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log("Language could not be read: " + e.message);
                console.log(langParser.checker.errors.map(e => e).join("\n"));
            }
        }
        expect(language).not.toBeNull();
        expect(language).not.toBeUndefined();
        if (!!language) {
            const editParser: FreEditParser | undefined = new FreEditParser(language);
            let editor: FreEditUnit | undefined = undefined;
            try {
                editor = editParser.parse(testdir + "test3.edit");
            } catch (e: unknown) {
                if (e instanceof Error) {
                    console.log("Edit definition could not be read: " + e.message);
                    console.log(editParser.checker.errors.map(e => e).join("\n"));
                }
            }
            if (!!editor) {
                const generator = new ReaderWriterGenerator();
                generator.language = language;
                generator.outputfolder = outputDir;
                generator.generate(editor);
                const grammarFile = outputDir + "reader/gen/TEST3Grammar.ts";
                const isPresent: boolean = fs.existsSync(grammarFile);
                expect(isPresent).toBe(true);
                if (isPresent) {
                    const result = fs.readFileSync(grammarFile, "utf8");
                    expect(result).toMatchSnapshot();
                }
            }
        }
    });

    test("on abstract concepts and interfaces", () => {
        const langParser = new LanguageParser();
        try {
            language = langParser.parse(testdir + "test4.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log("Language could not be read: " + e.message);
                console.log(langParser.checker.errors.map(e => e).join("\n"));
            }
        }
        expect(language).not.toBeNull();
        expect(language).not.toBeUndefined();
        if (!!language) {
            const editParser: FreEditParser | undefined = new FreEditParser(language);
            let editor: FreEditUnit | undefined = undefined;
            try {
                editor = editParser.parse(testdir + "test4.edit");
            } catch (e: unknown) {
                if (e instanceof Error) {
                    console.log("Edit definition could not be read: " + e.message);
                    console.log(editParser.checker.errors.map(e => e).join("\n"));
                }
            }
            if (!!editor) {
                const generator = new ReaderWriterGenerator();
                generator.language = language;
                generator.outputfolder = outputDir;
                generator.generate(editor);
                const grammarFile = outputDir + "reader/gen/TEST4Grammar.ts";
                const isPresent: boolean = fs.existsSync(grammarFile);
                expect(isPresent).toBe(true);
                if (isPresent) {
                    const result = fs.readFileSync(grammarFile, "utf8");
                    expect(result).toMatchSnapshot();
                }
            }
            // TODO should projections for interfaces be taken into account??
        }
    });

});
