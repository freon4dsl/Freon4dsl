import { FreClassifier, FreLanguage } from "../../languagedef/metalanguage";
import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { Checker, MetaLogger } from "../../utils";
import { FreEditParser } from "../../editordef/parser/FreEditParser";
import {
    FreEditProjection,
    FreEditProjectionItem,
    FreEditProjectionLine,
    FreEditUnit,
    FreOptionalPropertyProjection
} from "../../editordef/metalanguage";

function getAndTestProjection(editDef: FreEditUnit, classifier: FreClassifier) {
    let myProj: FreEditProjection = editDef.getDefaultProjectiongroup().findNonTableProjectionForType(classifier);
    expect(myProj).not.toBeNull();
    expect(myProj).not.toBeUndefined();
    return myProj;
}

describe("Checking indentation ", () => {
    const testdir = "src/__tests__/editor-tests/indentationFiles/";
    let parser: FreEditParser;
    let language: FreLanguage;
    let checker: Checker<FreEditUnit>;
    // MetaLogger.muteAllErrors();
    // MetaLogger.muteAllLogs();

    beforeEach(() => {
        try {
            language = new LanguageParser().parse("src/__tests__/commonAstFiles/test-language.ast");
            parser = new FreEditParser(language);
            checker = parser.checker;
        } catch (e) {
            console.log("Language could not be read");
        }
    });

    test("without optionals", () => {
        let editDef: FreEditUnit;
        try {
            editDef = parser.parse(testdir + "test1.edit");
        } catch (e) {
            console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
            expect(e.message).toBeNull;
        }
        const myAAA: FreClassifier = language.units.find(c => c.name === "AAAAAA");
        expect(myAAA).not.toBeNull();
        expect(myAAA).not.toBeUndefined();
        let myProj: FreEditProjection = getAndTestProjection(editDef, myAAA);
        expect(myProj.lines[1].indent).toBe(0);
        //
        const myBB = language.concepts.find(c => c.name === "BB");
        expect(myBB).not.toBeNull();
        myProj = getAndTestProjection(editDef, myBB);
        expect(myProj.lines[0].indent).toBe(2);
        expect(myProj.lines[1].indent).toBe(0);
        //
        const myCC = language.concepts.find(c => c.name === "CC");
        expect(myCC).not.toBeNull();
        myProj = getAndTestProjection(editDef, myCC);
        expect(myProj.lines[0].indent).toBe(9);
        expect(myProj.lines[1].indent).toBe(1);
        expect(myProj.lines[2].indent).toBe(0);
        expect(myProj.lines[3].indent).toBe(5);
        // expect(false).toBe(true);
    });

    test("without optionals with unequal []", () => {
        let editDef: FreEditUnit;
        try {
            editDef = parser.parse(testdir + "test2.edit");
        } catch (e) {
            console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
            expect(e.message).toBeNull;
        }
        const myAAA: FreClassifier = language.units.find(c => c.name === "AAAAAA");
        expect(myAAA).not.toBeNull();
        expect(myAAA).not.toBeUndefined();
        // expect(false).toBe(true);
        let myProj: FreEditProjection = getAndTestProjection(editDef, myAAA);
        expect(myProj.lines[0].indent).toBe(0);
        //
        const myBB = language.concepts.find(c => c.name === "BB");
        expect(myBB).not.toBeNull();
        myProj = getAndTestProjection(editDef, myBB);
        expect(myProj.lines[0].indent).toBe(2);
        expect(myProj.lines[1].indent).toBe(0);
        //
        const myCC = language.concepts.find(c => c.name === "CC");
        expect(myCC).not.toBeNull();
        myProj = getAndTestProjection(editDef, myCC);
        expect(myProj.lines[0].indent).toBe(9);
        expect(myProj.lines[1].indent).toBe(1);
        expect(myProj.lines[2].indent).toBe(0);
        expect(myProj.lines[3].indent).toBe(5);

    });

    test("without optionals with equal, indented []", () => {
        let editDef: FreEditUnit;
        try {
            editDef = parser.parse(testdir + "test3.edit");
        } catch (e) {
            console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
            expect(e.message).toBeNull;
        }
        const myAAA: FreClassifier = language.units.find(c => c.name === "AAAAAA");
        expect(myAAA).not.toBeNull();
        expect(myAAA).not.toBeUndefined();
        // expect(false).toBe(true);
        let myProj = getAndTestProjection(editDef, myAAA);
        expect(myProj.lines[0].indent).toBe(0);
        //
        const myBB = language.concepts.find(c => c.name === "BB");
        expect(myBB).not.toBeNull();
        myProj = getAndTestProjection(editDef, myBB);
        expect(myProj.lines[0].indent).toBe(2);
        expect(myProj.lines[1].indent).toBe(0);
        //
        const myCC = language.concepts.find(c => c.name === "CC");
        expect(myCC).not.toBeNull();
        myProj = getAndTestProjection(editDef, myCC);
        // expect(false).toBe(true);
        expect(myProj.lines[0].indent).toBe(9);
        expect(myProj.lines[1].indent).toBe(1);
        expect(myProj.lines[2].indent).toBe(0);
        expect(myProj.lines[3].indent).toBe(5);
    });

    test("with single line optionals", () => {
        let editDef: FreEditUnit;
        try {
            editDef = parser.parse(testdir + "test4.edit");
        } catch (e) {
            console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
            expect(e.message).toBeNull;
        }
        const myCC = language.concepts.find(c => c.name === "CC");
        expect(myCC).not.toBeNull();
        const myProj = getAndTestProjection(editDef, myCC);
        expect(myProj.lines[0].indent).toBe(9);
        expect(myProj.lines[1].indent).toBe(1);
        expect(myProj.lines[2].indent).toBe(0);
        expect(myProj.lines[3].indent).toBe(5);
    });

    test("with multi line optionals more than other indents", () => {
        let editDef: FreEditUnit;
        try {
            editDef = parser.parse(testdir + "test5.edit");
        } catch (e) {
            console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
            expect(e.message).toBeNull;
        }
        const myCC = language.concepts.find(c => c.name === "CC");
        expect(myCC).not.toBeNull();
        const myProj = getAndTestProjection(editDef, myCC);
        expect(myProj.lines[0].indent).toBe(9);
        expect(myProj.lines[1].indent).toBe(1);
        expect(myProj.lines[2].indent).toBe(0);
        expect(myProj.lines[3].indent).toBe(5);
        const myOptional: FreEditProjectionItem = myProj.lines[3].items[0];
        expect(myOptional instanceof FreOptionalPropertyProjection).toBe(true);
        expect((myOptional as FreOptionalPropertyProjection).lines[1].indent).toBe(9);   // line with 'text'
        expect((myOptional as FreOptionalPropertyProjection).lines[2].indent).toBe(11);   // line with CCprop10
        expect((myOptional as FreOptionalPropertyProjection).lines[3].indent).toBe(13);   // line with 'more text'
    });

    test("with multi line optionals less than other indents", () => {
        let editDef: FreEditUnit;
        try {
            editDef = parser.parse(testdir + "test6.edit");
        } catch (e) {
            console.log(e.message + e.stack);
            // console.log(checker.errors.map(err => `"${err}"`).join("\n"));
            expect(e.message).toBeNull;
        }
        const myCC = language.concepts.find(c => c.name === "CC");
        expect(myCC).not.toBeNull();
        const myProj = getAndTestProjection(editDef, myCC);
        expect(myProj.lines[0].indent).toBe(16);    // line with 'text1'
        expect(myProj.lines[1].indent).toBe(8);     // line with 'CCprop8'
        expect(myProj.lines[2].indent).toBe(7);     // line with 'text2'
        const myOptional: FreEditProjectionItem = myProj.lines[3].items[0];
        expect(myOptional instanceof FreOptionalPropertyProjection).toBe(true);
        expect((myOptional as FreOptionalPropertyProjection).lines[1].indent).toBe(7);   // line with 'innertext'
        expect((myOptional as FreOptionalPropertyProjection).lines[2].indent).toBe(1);   // line with CCprop10
        expect((myOptional as FreOptionalPropertyProjection).lines[3].indent).toBe(0);   // line with 'more text'
    });
});
