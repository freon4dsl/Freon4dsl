import { FreMetaLanguage } from '../../languagedef/metalanguage/index.js';
import { describe, test, expect, beforeEach, afterAll } from 'vitest';
import { MetaLogger } from '../../utils/no-dependencies/index.js';
import { ScoperParser } from '../../scoperdef/parser/ScoperParser.js';
import { ScoperGenerator } from '../../scoperdef/generator/ScoperGenerator.js';
import { ScopeDef } from '../../scoperdef/metalanguage/index.js';
import { LanguageParser } from '../../languagedef/parser/LanguageParser.js';
import * as fs from "fs";
import { FileUtil } from '../../utils/file-utils/index.js';
import { resolveOutDir, resolveTestDir } from '../TestPathHelpers.js';


describe("Checking the scoper generator", () => {
    const testdir: string = resolveTestDir(import.meta.url, "scopeDefFiles/");
    const outputDir: string = resolveOutDir(import.meta.url, "generated2/");
    let parser: ScoperParser;
    let language: FreMetaLanguage | undefined;
    let generator: ScoperGenerator = new ScoperGenerator();
    MetaLogger.muteAllErrors();
    MetaLogger.muteAllLogs();

    beforeEach(() => {
        try {
            language = new LanguageParser().parse(testdir + "ScoperTest.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log("Language could not be read");
            }
        }
        parser = new ScoperParser(language);
    });

    afterAll(() => {
        FileUtil.deleteDirAndContent(outputDir + "scoper/");
        FileUtil.deleteDirAndContent(outputDir + "scoper/");
        FileUtil.deleteDirAndContent(outputDir);
    });

    // todo remove '.skip'
    test("scope file for 'ScoperTest' is correctly generated", () => {
        if (!!language) {
            let scopeDef: ScopeDef;
            try {
                scopeDef = parser.parse(testdir + "ScoperTest.scope");
            } catch (e: unknown) {
                if (e instanceof Error) {
                    console.log(e.message + e.stack);
                    console.log(parser.checker.errors.map(err => `"${err}"`).join("\n"));
                }
            }
            expect(scopeDef).not.toBeNull();
            expect(scopeDef).not.toBeUndefined();
            // a change to make git commit this file again
            generator.language = language;
            generator.outputfolder = outputDir;
            generator.generate(scopeDef!);
            const outputFile = outputDir + "scoper/ScoperModelScoper.ts";
            const isPresent: boolean = FileUtil.exists(outputFile);
            expect(isPresent).toBe(true);
            if (isPresent) {
                const result = fs.readFileSync(outputFile, "utf8");
                expect(result).toMatchSnapshot();
            }
        }
    });

});
