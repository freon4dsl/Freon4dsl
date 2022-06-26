import { PiTyperMerger } from "../../typerdef/parser";
import { PiLanguage } from "../../languagedef/metalanguage";
import { MetaLogger } from "../../utils";
import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { PitClassifierSpec, PitInferenceRule, PiTyperDef } from "../../typerdef/metalanguage";

function testTypeUnit(typeUnit: PiTyperDef) {
    expect(typeUnit).not.toBeNull();
    expect(typeUnit).not.toBeUndefined();
    // console.log(typeUnit?.toPiString());
    expect(typeUnit.types.length).toBe(3);
    expect(typeUnit.conceptsWithType.length).toBe(13);
    // console.log(typeUnit.conceptsWithType.map(t => t.name).join(", "))
    expect(typeUnit.anyTypeSpec).not.toBeNull();

    const stringLitRule = typeUnit.classifierSpecs.find(rule => rule.myClassifier.name === "StringLiteral");
    expect(stringLitRule).not.toBeNull();
    expect(stringLitRule instanceof PitClassifierSpec).toBeTruthy();
    const inferOfStringLit = (stringLitRule as PitClassifierSpec).rules.find(r => r instanceof PitInferenceRule);
    expect(inferOfStringLit).not.toBeNull();
    // expect(inferOfStringLit.returnType).not.toBeNull();
    // expect(inferOfStringLit.returnType.name).toBe(predefType.name);

    const plusExpRule = typeUnit.classifierSpecs.find(rule => rule.myClassifier.name === "PlusExp");
    expect(plusExpRule).not.toBeNull();
    expect(plusExpRule instanceof PitClassifierSpec).toBeTruthy();
    const inferOfPlusExp = (plusExpRule as PitClassifierSpec).rules.find(r => r instanceof PitInferenceRule);
    expect(inferOfPlusExp).not.toBeNull();
    // expect(inferOfPlusExp.returnType).not.toBeNull();
    // expect(inferOfPlusExp.returnType.name).toBe(predefType.name);
}

describe("Checking new typer", () => {
    const testdir = "src/__tests__/typer-tests/correctDefFiles/";
    const langParser = new LanguageParser();

    let parser: PiTyperMerger;
    let language: PiLanguage;
    MetaLogger.muteAllLogs();
    MetaLogger.muteAllErrors();

    beforeEach(() => {
        try {
            language = langParser.parse(testdir + "projectY.ast");
            parser = new PiTyperMerger(language);
        } catch (e) {
            console.log("Language could not be read: " + e.stack);
            // console.log("found errors in .ast: " + langParser.checker.errors.map(e => e).join("\n"));
        }
    });

    test(" on projectY.type file", () => {
        if(!!language) {
            const predefType = language.concepts.find(x => x.name === "PredefinedType");
            expect(predefType).not.toBeNull();
            expect(predefType).not.toBeUndefined();

            const namedType = language.conceptsAndInterfaces().find(x => x.name === "NamedType");
            expect(namedType).not.toBeNull();
            expect(namedType).not.toBeUndefined();

            let typeUnit: PiTyperDef;
            try {
                if (!!parser) {
                    typeUnit = parser.parse(testdir + "projectY.type");
                }
            } catch (e) {
                // console.log(e.stack);
                const errors: string[] = parser.checker.errors;
                expect(errors.length).toBe(0);
                // console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
            }

           // console.log(typeUnit?.toPiString());
            testTypeUnit(typeUnit);
        }
    });

    test(" on multiple type files", () => {
        if(!!language) {
            const predefType = language.concepts.find(x => x.name === "PredefinedType");
            expect(predefType).not.toBeNull();
            expect(predefType).not.toBeUndefined();

            const namedType = language.conceptsAndInterfaces().find(x => x.name === "NamedType");
            expect(namedType).not.toBeNull();
            expect(namedType).not.toBeUndefined();

            let typeUnit: PiTyperDef;
            try {
                if (!!parser) {
                    typeUnit = parser.parseMulti(
                        [testdir + "multiFileInput/projectY-part1.type",
                            testdir + "multiFileInput/projectY-part2.type"]);
                }
            } catch (e) {
                // console.log(e.stack);
                const errors: string[] = parser.checker.errors;
                expect(errors.length).toBe(0);
                // console.log("found " + errors.length + " errors: " + errors.map(e => e).join("\n"));
            }
            testTypeUnit(typeUnit);
        }
    });
});
