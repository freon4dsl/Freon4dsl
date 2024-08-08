import {FreMetaClassifier, FreMetaConcept, FreMetaLanguage} from "../../languagedef/metalanguage/index.js";
import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { Checker } from "../../utils/index.js";
import { FreEditParser } from "../../editordef/parser/FreEditParser";
import {
    FreEditNormalProjection, FreEditProjectionGroup,
    FreEditProjectionItem,
    FreEditUnit,
    FreOptionalPropertyProjection
} from "../../editordef/metalanguage/index.js";
import { describe, test, expect, beforeEach } from "vitest"

function getAndTestProjection(editDef: FreEditUnit, classifier: FreMetaClassifier) {
    const defProjGroup: FreEditProjectionGroup | undefined = editDef.getDefaultProjectiongroup();
    expect(defProjGroup).not.toBeNull();
    const myProj: FreEditNormalProjection | undefined = defProjGroup!.findNonTableProjectionForType(classifier);
    expect(myProj).not.toBeNull();
    expect(myProj).not.toBeUndefined();
    return myProj;
}

describe("Checking indentation ", () => {
    const testdir = "src/__tests__/editor-tests/indentationFiles/";
    let parser: FreEditParser;
    let language: FreMetaLanguage | undefined;
    let checker: Checker<FreEditUnit>;
    // MetaLogger.muteAllErrors();
    // MetaLogger.muteAllLogs();

    beforeEach(() => {
        try {
            language = new LanguageParser().parse("src/__tests__/commonAstFiles/test-language.ast");
            if (!!language) {
                parser = new FreEditParser(language);
                checker = parser.checker;
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log("Language could not be read");
            }
        }
    });

    test("without optionals", () => {
        let editDef: FreEditUnit | undefined;
        expect(language).not.toBeNull();
        expect(language).not.toBeUndefined();
        try {
            editDef = parser.parse(testdir + "test1.edit");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message + e.stack);
                // To avoid "error TS6133: 'checker' is declared but its value is never read.",
                // and still keep it easy to reintroduce the log statements,
                // we use variable 'checker' here unnecessary.
                checker.hasErrors();
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                // tslint:disable-next-line:no-unused-expression
                expect(e.message).toBeNull();
            }
        }
        const myAAA: FreMetaClassifier | undefined = language!.units.find(c => c.name === "AAAAAA");
        expect(myAAA).not.toBeNull();
        expect(myAAA).not.toBeUndefined();
        expect(editDef).not.toBeNull();
        expect(editDef).not.toBeUndefined();
        let myProj: FreEditNormalProjection | undefined = getAndTestProjection(editDef!, myAAA!);

        expect(myProj).not.toBeNull();
        expect(myProj).not.toBeUndefined();
        expect(myProj!.lines[1].indent).toBe(0);
        //
        const myBB: FreMetaConcept | undefined = language!.concepts.find(c => c.name === "BB");
        expect(myBB).not.toBeNull();
        expect(myBB).not.toBeUndefined();
        myProj = getAndTestProjection(editDef!, myBB!);
        expect(myProj).not.toBeNull();
        expect(myProj).not.toBeUndefined();
        expect(myProj!.lines[0].indent).toBe(2);
        expect(myProj!.lines[1].indent).toBe(0);
        //
        const myCC: FreMetaConcept | undefined = language!.concepts.find(c => c.name === "CC");
        expect(myCC).not.toBeNull();
        expect(myCC).not.toBeUndefined();
        myProj = getAndTestProjection(editDef!, myCC!);
        expect(myProj!.lines[0].indent).toBe(9);
        expect(myProj!.lines[1].indent).toBe(1);
        expect(myProj!.lines[2].indent).toBe(0);
        expect(myProj!.lines[3].indent).toBe(5);
    });

    test("without optionals with unequal []", () => {
        let editDef: FreEditUnit | undefined;
        expect(language).not.toBeNull();
        expect(language).not.toBeUndefined();
        try {
            editDef = parser.parse(testdir + "test2.edit");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                // tslint:disable-next-line:no-unused-expression
                expect(e.message).toBeNull();
            }
        }
        const myAAA: FreMetaClassifier | undefined = language!.units.find(c => c.name === "AAAAAA");
        expect(myAAA).not.toBeNull();
        expect(myAAA).not.toBeUndefined();
        expect(editDef).not.toBeNull();
        expect(editDef).not.toBeUndefined();
        // expect(false).toBe(true);
        let myProj: FreEditNormalProjection | undefined= getAndTestProjection(editDef!, myAAA!);
        expect(myProj).not.toBeNull();
        expect(myProj).not.toBeUndefined();
        expect(myProj!.lines[0].indent).toBe(0);
        //
        const myBB: FreMetaConcept | undefined = language!.concepts.find(c => c.name === "BB");
        expect(myBB).not.toBeNull();
        expect(myBB).not.toBeUndefined();
        myProj = getAndTestProjection(editDef!, myBB!);
        expect(myProj!.lines[0].indent).toBe(2);
        expect(myProj!.lines[1].indent).toBe(0);
        //
        const myCC: FreMetaConcept | undefined = language!.concepts.find(c => c.name === "CC");
        expect(myCC).not.toBeNull();
        expect(myCC).not.toBeUndefined();
        myProj = getAndTestProjection(editDef!, myCC!);
        expect(myProj!.lines[0].indent).toBe(9);
        expect(myProj!.lines[1].indent).toBe(1);
        expect(myProj!.lines[2].indent).toBe(0);
        expect(myProj!.lines[3].indent).toBe(5);

    });

    test("without optionals with equal, indented []", () => {
        let editDef: FreEditUnit | undefined;
        expect(language).not.toBeNull();
        expect(language).not.toBeUndefined();
        try {
            editDef = parser.parse(testdir + "test3.edit");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                // tslint:disable-next-line:no-unused-expression
                expect(e.message).toBeNull();
            }
        }
        const myAAA: FreMetaClassifier | undefined = language!.units.find(c => c.name === "AAAAAA");
        expect(myAAA).not.toBeNull();
        expect(myAAA).not.toBeUndefined();
        expect(editDef).not.toBeNull();
        expect(editDef).not.toBeUndefined();
        let myProj: FreEditNormalProjection | undefined = getAndTestProjection(editDef!, myAAA!);
        expect(myProj).not.toBeNull();
        expect(myProj).not.toBeUndefined();
        expect(myProj!.lines[0].indent).toBe(0);
        //
        const myBB: FreMetaConcept| undefined = language!.concepts.find(c => c.name === "BB");
        expect(myBB).not.toBeNull();
        expect(myBB).not.toBeUndefined();
        myProj = getAndTestProjection(editDef!, myBB!);
        expect(myProj!.lines[0].indent).toBe(2);
        expect(myProj!.lines[1].indent).toBe(0);
        //
        const myCC = language!.concepts.find(c => c.name === "CC");
        expect(myCC).not.toBeNull();
        expect(myCC).not.toBeUndefined();
        myProj = getAndTestProjection(editDef!, myCC!);
        // expect(false).toBe(true);
        expect(myProj!.lines[0].indent).toBe(9);
        expect(myProj!.lines[1].indent).toBe(1);
        expect(myProj!.lines[2].indent).toBe(0);
        expect(myProj!.lines[3].indent).toBe(5);
    });

    test("with single line optionals", () => {
        let editDef: FreEditUnit | undefined;
        expect(language).not.toBeNull();
        expect(language).not.toBeUndefined();
        try {
            editDef = parser.parse(testdir + "test4.edit");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                // tslint:disable-next-line:no-unused-expression
                expect(e.message).toBeNull();
            }
        }
        expect(editDef).not.toBeNull();
        expect(editDef).not.toBeUndefined();
        const myCC = language!.concepts.find(c => c.name === "CC");
        expect(myCC).not.toBeNull();
        expect(myCC).not.toBeUndefined();
        const myProj = getAndTestProjection(editDef!, myCC!);
        expect(myProj).not.toBeNull();
        expect(myProj).not.toBeUndefined();
        expect(myProj!.lines[0].indent).toBe(9);
        expect(myProj!.lines[1].indent).toBe(1);
        expect(myProj!.lines[2].indent).toBe(0);
        expect(myProj!.lines[3].indent).toBe(5);
    });

    test("with multi line optionals more than other indents", () => {
        let editDef: FreEditUnit | undefined;
        expect(language).not.toBeNull();
        expect(language).not.toBeUndefined();
        try {
            editDef = parser.parse(testdir + "test5.edit");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                // tslint:disable-next-line:no-unused-expression
                expect(e.message).toBeNull();
            }
        }
        expect(editDef).not.toBeNull();
        expect(editDef).not.toBeUndefined();
        const myCC = language!.concepts.find(c => c.name === "CC");
        expect(myCC).not.toBeNull();
        expect(myCC).not.toBeUndefined();
        const myProj = getAndTestProjection(editDef!, myCC!);
        expect(myProj).not.toBeNull();
        expect(myProj).not.toBeUndefined();
        expect(myProj!.lines[0].indent).toBe(9);
        expect(myProj!.lines[1].indent).toBe(1);
        expect(myProj!.lines[2].indent).toBe(0);
        expect(myProj!.lines[3].indent).toBe(5);
        const myOptional: FreEditProjectionItem = myProj!.lines[3].items[0];
        expect(myOptional instanceof FreOptionalPropertyProjection).toBe(true);
        expect((myOptional as FreOptionalPropertyProjection).lines[1].indent).toBe(9);   // line with 'text'
        expect((myOptional as FreOptionalPropertyProjection).lines[2].indent).toBe(11);   // line with CCprop10
        expect((myOptional as FreOptionalPropertyProjection).lines[3].indent).toBe(13);   // line with 'more text'
    });

    test("with multi line optionals less than other indents", () => {
        let editDef: FreEditUnit | undefined;
        expect(language).not.toBeNull();
        expect(language).not.toBeUndefined();
        try {
            editDef = parser.parse(testdir + "test6.edit");
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message + e.stack);
                // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
                // tslint:disable-next-line:no-unused-expression
                expect(e.message).toBeNull();
            }
        }
        expect(editDef).not.toBeNull();
        expect(editDef).not.toBeUndefined();
        const myCC = language!.concepts.find(c => c.name === "CC");
        expect(myCC).not.toBeNull();
        expect(myCC).not.toBeUndefined();
        const myProj = getAndTestProjection(editDef!, myCC!);
        expect(myProj).not.toBeNull();
        expect(myProj).not.toBeUndefined();
        expect(myProj!.lines[0].indent).toBe(16);    // line with 'text1'
        expect(myProj!.lines[1].indent).toBe(8);     // line with 'CCprop8'
        expect(myProj!.lines[2].indent).toBe(7);     // line with 'text2'
        const myOptional: FreEditProjectionItem = myProj!.lines[3].items[0];
        expect(myOptional instanceof FreOptionalPropertyProjection).toBe(true);
        expect((myOptional as FreOptionalPropertyProjection).lines[1].indent).toBe(7);   // line with 'innertext'
        expect((myOptional as FreOptionalPropertyProjection).lines[2].indent).toBe(1);   // line with CCprop10
        expect((myOptional as FreOptionalPropertyProjection).lines[3].indent).toBe(0);   // line with 'more text'
    });
});
