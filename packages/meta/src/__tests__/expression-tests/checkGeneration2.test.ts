import { LanguageParser } from "../../languagedef/parser/LanguageParser.js";
import { FreMetaLanguage } from '../../languagedef/metalanguage/index.js';
import { LanguageExpressionTester } from "../../langexpressions/parser/LanguageExpressionTester.js";
import { LanguageExpressionParser } from "../../langexpressions/parser/LanguageExpressionParser.js";
import { describe, test, expect, beforeEach } from "vitest";
import { ExpressionGenerationUtil } from '../../langexpressions/generator/ExpressionGenerationUtil.js';
import { Imports } from '../../utils/on-lang/index.js';
import { resolveTestDir } from '../TestPathHelpers.js';

describe("Checking generation of expressions", () => {
    const testdir: string = resolveTestDir(import.meta.url, "expressionDefFiles/");
    let language: FreMetaLanguage | undefined;
    let expressionDefs: LanguageExpressionTester | undefined;
    let imports: Imports = new Imports();
    // MetaLogger.muteAllErrors();
    // MetaLogger.muteAllLogs();

    beforeEach(() => {
        try {
            language = new LanguageParser().parse(testdir + "testLanguage.ast");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log("Language could not be read");
            }
        }
        if (!!language) {
            const expressionFile = testdir + "test2.fretest";
            expressionDefs = new LanguageExpressionParser(language).parse(
              expressionFile
            );
            expect(expressionDefs).not.toBeNull();
            expect(expressionDefs).not.toBeUndefined();
        }
    });

    test("on lists of lists", () => {
        if (!!expressionDefs) {
            // find the set of expressions to generate
            const AAconceptExps = expressionDefs!.conceptExps.find((ce) => ce.classifierRef.name === "AA");
            expect(AAconceptExps).not.toBeNull();
            expect(AAconceptExps).not.toBeUndefined();

            let resultStr: string = "";
            AAconceptExps!.exps.forEach((exp) => {
                resultStr += ExpressionGenerationUtil.langExpToTypeScript(exp, "node", imports) + "\n";
            });
            // console.log(resultStr);
            expect(resultStr.includes("node.AAprop8.map((x: BB) => x.BBprop12).flat()")).toBeTruthy();
            expect(resultStr.includes("node.AAprop10.map((x: CC) => x.CCprop13)")).toBeTruthy();
            expect(resultStr.includes("node.AAprop10.map((x: CC) => x.CCprop14).flat()")).toBeTruthy();
            expect(resultStr.includes("node.AAprop12.map((x: DD) => x.DDprop8).flat().map((x: BB) => x.BBprop5)")).toBeTruthy();
            expect(resultStr.includes("node.AAprop12.map((x: DD) => x.DDprop8).flat().map((x: BB) => LanguageEnvironment.getInstance().typer.inferType(x).toAstElement())")).toBeTruthy();
            expect(resultStr.includes("node.AAprop12.map((x: DD) => x.DDprop7)?.map((x: BB) => LanguageEnvironment.getInstance().typer.inferType(x).toAstElement())")).toBeTruthy();
        } else {
            console.log("Language or Expressions not present");
        }
    });
});
