import { LanguageParser } from "../../languagedef/parser/LanguageParser.js";
import { FreMetaLanguage } from '../../languagedef/metalanguage';
import { LanguageExpressionTesterNew } from "../../langexpressions/parser/LanguageExpressionTesterNew.js";
import { LanguageExpressionParserNew } from "../../langexpressions/parser/LanguageExpressionParserNew.js";
import { describe, test, expect, beforeEach } from "vitest";
import { ExpressionGenerationUtil } from '../../langexpressions/generator/ExpressionGenerationUtil';

describe("Checking expression on referredProperty", () => {
    const testdir = "src/__tests__/new-expression-tests/expressionDefFiles/";
    let language: FreMetaLanguage | undefined;
    let expressionDefs: LanguageExpressionTesterNew | undefined;
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
            const expressionFile = testdir + "test1.fretest";
            expressionDefs = new LanguageExpressionParserNew(language).parse(
              expressionFile
            );
            expect(expressionDefs).not.toBeNull();
            expect(expressionDefs).not.toBeUndefined();
        }
    });

    test("generation of expressions on AA", () => {
        if (!!expressionDefs) {
            // find the set of expressions to generate
            const AAconceptExps = expressionDefs!.conceptExps.find((ce) => ce.classifierRef.name === "AA");
            expect(AAconceptExps).not.toBeNull();
            expect(AAconceptExps).not.toBeUndefined();

            let resultStr: string = "";
            AAconceptExps!.exps.forEach((exp) => {
                resultStr += ExpressionGenerationUtil.langExpToTypeScript(exp, "node");
            });
            expect(resultStr.includes("node.AAprop1")).toBeTruthy();
            expect(resultStr.includes("node.AAprop2")).toBeTruthy();
            expect(resultStr.includes("node.AAprop3")).toBeTruthy();
            expect(resultStr.includes("node.AAprop4")).toBeTruthy();
            expect(resultStr.includes("node.AAprop5")).toBeTruthy();
            expect(resultStr.includes("node.AAprop6")).toBeTruthy();
            expect(resultStr.includes("node.AAprop7")).toBeTruthy();
            expect(resultStr.includes("node.AAprop8")).toBeTruthy();
            expect(resultStr.includes("node.AAprop9")).toBeTruthy();
            expect(resultStr.includes("node.AAprop10")).toBeTruthy();
            expect(resultStr.includes("node.AAprop11")).toBeTruthy();
            expect(resultStr.includes("node.AAprop12")).toBeTruthy();
            expect(resultStr.includes("node.AAprop13")).toBeTruthy();
            expect(resultStr.includes("node.AAprop14")).toBeTruthy();
            expect(resultStr.includes("node.AAprop12.map(_x => _x.DDprop8).flat().map(_x => _x.BBprop5)")).toBeTruthy();
        } else {
            console.log("Language or Expressions not present");
        }
    });

    test("generation of expressions on BB", () => {
        if (!!expressionDefs) {
            // find the set of expressions to generate
            const BBconceptExps = expressionDefs!.conceptExps.find((ce) => ce.classifierRef.name === "BB");
            expect(BBconceptExps).not.toBeNull();
            expect(BBconceptExps).not.toBeUndefined();

            let resultStr: string = "";
            BBconceptExps!.exps.forEach((exp) => {
                resultStr += ExpressionGenerationUtil.langExpToTypeScript(exp, "node");
            });
            expect(resultStr.includes("node.BBprop15")).toBeTruthy();
            expect(resultStr.includes("node.BBprop16")).toBeTruthy();
            expect(resultStr.includes("node.BBprop17")).toBeTruthy();
            expect(resultStr.includes("node.BBprop18")).toBeTruthy();
        } else {
            console.log("Language or Expressions not present");
        }
    });

    test("generation of expressions in CC", () => {
        if (!!expressionDefs) {
            // find the set of expressions to generate
            const CCconceptExps = expressionDefs!.conceptExps.find((ce) => ce.classifierRef.name === "CC");
            expect(CCconceptExps).not.toBeNull();
            expect(CCconceptExps).not.toBeUndefined();

            let resultStr: string = "";
            CCconceptExps!.exps.forEach((exp) => {
                resultStr += ExpressionGenerationUtil.langExpToTypeScript(exp, "node");
            });
            expect(resultStr.includes("ZZ.instanceZZ1")).toBeTruthy();
        } else {
            console.log("Language or Expressions not present");
        }
    });

    test("generation of expressions in DD", () => {
        if (!!expressionDefs) {
            // find the set of expressions to generate
            const DDconceptExps = expressionDefs!.conceptExps.find((ce) => ce.classifierRef.name === "DD");
            expect(DDconceptExps).not.toBeNull();
            expect(DDconceptExps).not.toBeUndefined();

            let resultStr: string = "";
            DDconceptExps!.exps.forEach((exp) => {
                resultStr += ExpressionGenerationUtil.langExpToTypeScript(exp, "node");
            });
            expect(resultStr.includes("LanguageEnvironment.getInstance().typer.inferType(node.DDprop7)")).toBeTruthy();
            expect(resultStr.includes("node.DDprop8.map(_x => LanguageEnvironment.getInstance().typer.inferType(_x))")).toBeTruthy();
        } else {
            console.log("Language or Expressions not present");
        }
    });

    test("generation of expressions in EE", () => {
        if (!!expressionDefs) {
            // find the set of expressions to generate
            const EEconceptExps = expressionDefs!.conceptExps.find((ce) => ce.classifierRef.name === "EE");
            expect(EEconceptExps).not.toBeNull();
            expect(EEconceptExps).not.toBeUndefined();

            let resultStr: string = "";
            EEconceptExps!.exps.forEach((exp) => {
                resultStr += ExpressionGenerationUtil.langExpToTypeScript(exp, "node");
                console.log(ExpressionGenerationUtil.langExpToTypeScript(exp, "node"))
            });
            expect(resultStr.includes("node.freOwner()")).toBeTruthy();
        } else {
            console.log("Language or Expressions not present");
        }
    });

    test("generation of applied feature in FF", () => {
        if (!!expressionDefs) {
            // find the set of expressions to generate
            const FFconceptExps = expressionDefs!.conceptExps.find((ce) => ce.classifierRef.name === "FF");
            expect(FFconceptExps).not.toBeNull();
            expect(FFconceptExps).not.toBeUndefined();

            let resultStr: string = "";
            FFconceptExps!.exps.forEach((exp) => {
                resultStr += ExpressionGenerationUtil.langExpToTypeScript(exp, "node");
                console.log(ExpressionGenerationUtil.langExpToTypeScript(exp, "node"))
            });
            expect(resultStr.includes("node.ee.dd.cc.bb.aa")).toBeTruthy();
        } else {
            console.log("Language or Expressions not present");
        }
    });
});
