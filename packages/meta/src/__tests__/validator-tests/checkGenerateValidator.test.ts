import { FreMetaLanguage } from '../../languagedef/metalanguage/index.js';
import { describe, test, expect, beforeEach, afterAll } from 'vitest';
import { MetaLogger } from '../../utils/no-dependencies/index.js';
import { LanguageParser } from '../../languagedef/parser/LanguageParser.js';
import * as fs from "fs";
import { FileUtil } from '../../utils/file-utils/index.js';
import { ValidatorParser } from '../../validatordef/parser/ValidatorParser.js';
import { ValidatorGenerator } from '../../validatordef/generator/index.js';
import { ValidatorDef } from '../../validatordef/metalanguage/index.js';
import { resolveAstFile, resolveOutDir, resolveTestDir } from '../TestPathHelpers.js';


describe("Checking the validator generator", () => {
    const testdir: string = resolveTestDir(import.meta.url, "validatorDefFiles/");
    const outputDir : string = resolveOutDir(import.meta.url, "generated1/");
    let parser: ValidatorParser;
    let language: FreMetaLanguage | undefined;
    let generator: ValidatorGenerator = new ValidatorGenerator();
    MetaLogger.muteAllErrors();
    MetaLogger.muteAllLogs();

    beforeEach(() => {
        try {
            const astPath: string = resolveAstFile(import.meta.url, "../commonAstFiles", "test-language.ast");
            language = new LanguageParser().parse(astPath);
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log("Language could not be read");
            }
        }
        parser = new ValidatorParser(language);
    });

    afterAll(() => {
        FileUtil.deleteDirAndContent(outputDir + "validator/gen/");
        FileUtil.deleteDirAndContent(outputDir + "validator/");
        FileUtil.deleteDirAndContent(outputDir);
    });

    test("validator file for 'test-correct1' is correctly generated", () => {
        if (!!language) {
            //
            const validatorDef: ValidatorDef = parser.parse(testdir + "test-correct1.valid");
            expect(validatorDef).not.toBeNull();
            expect(validatorDef).not.toBeUndefined();
            //
            generator.language = language;
            generator.outputfolder = outputDir;
            generator.generate(validatorDef!);
            const outputFile = outputDir + "validator/gen/ROOTValidationRulesChecker.ts";
            const isPresent: boolean = fs.existsSync(outputFile);
            expect(isPresent).toBe(true);
            if (isPresent) {
                const result
                  = fs.readFileSync(outputFile, "utf8");
                expect(result).toMatchSnapshot();
            }
        }
    });
});
