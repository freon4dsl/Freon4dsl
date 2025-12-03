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
    const outputDir: string = resolveOutDir(import.meta.url, "generated1/");
    let parser: ScoperParser;
    let language: FreMetaLanguage | undefined;
    let generator: ScoperGenerator = new ScoperGenerator();
    MetaLogger.muteAllErrors();
    MetaLogger.muteAllLogs();

    beforeEach(() => {
        try {
            language = new LanguageParser().parse(testdir + "testLanguage.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log("Language could not be read");
            }
        }
        parser = new ScoperParser(language);
    });

    afterAll(() => {
        FileUtil.deleteDirAndContent(outputDir + "scoper/gen/");
        FileUtil.deleteDirAndContent(outputDir + "scoper/");
        FileUtil.deleteDirAndContent(outputDir);
    });

    test("scope file for 'test-correct1' is correctly generated", () => {
        if (!!language) {
            //
            const scopeDef: ScopeDef = parser.parse(testdir + "test-correct1.scope");
            expect(scopeDef).not.toBeNull();
            expect(scopeDef).not.toBeUndefined();
            //
            generator.language = language;
            generator.outputfolder = outputDir;
            generator.generate(scopeDef!);
            const outputFile = outputDir + "scoper/gen/ROOTScoper.ts";
            const isPresent: boolean = FileUtil.exists(outputFile);
            expect(isPresent).toBe(true);
            if (isPresent) {
                const result = fs.readFileSync(outputFile, "utf8");
                expect(result).toMatchSnapshot();
            }
        }
    });
});
