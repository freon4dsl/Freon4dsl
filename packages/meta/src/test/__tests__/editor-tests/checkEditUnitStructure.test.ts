import { PiBinaryExpressionConcept, PiLanguage, PiLimitedConcept } from "../../../languagedef/metalanguage";
import { LanguageParser } from "../../../languagedef/parser/LanguageParser";
import { Checker, MetaLogger } from "../../../utils";
import { PiEditParser } from "../../../editordef/parser/PiEditParser";
import { PiEditClassifierProjection, PiEditProjection, PiEditPropertyProjection, PiEditUnit } from "../../../editordef/metalanguage";
import { DefaultEditorGenerator } from "../../../editordef/metalanguage/DefaultEditorGenerator";

describe("Checking editor definition on checking errors", () => {
    const testdir = "src/test/__tests__/editor-tests/correctDefFiles/";
    let parser: PiEditParser;
    let language: PiLanguage;
    let checker: Checker<PiEditUnit>;
    MetaLogger.muteAllErrors();
    MetaLogger.muteAllLogs();

    function readFile(parseFile: string): PiEditUnit {
        // read the language file (.ast)
        try {
            language = new LanguageParser().parse("src/test/__tests__/commonAstFiles/test-language.ast");
            parser = new PiEditParser(language);
            checker = parser.checker;
        } catch (e) {
            console.log("Language could not be read");
        }
        // read the .edit file
        let editor: PiEditUnit;
        try {
            editor = parser.parse(parseFile);
        } catch (e) {
            console.log(e.message + e.stack);
            console.log(checker.errors.map(err => `"${err}"`).join("\n"));
        }
        if (editor !== null && editor !== undefined) {
            DefaultEditorGenerator.addDefaults(editor);
        } else {
            throw new Error("No editor!!")
            // console.log("No editor!!")
        }
        return editor;
    }

    test("all non-limited, non-binary expression concepts have a default-default projection and there is a default projection group", () => {
        const editor = readFile(testdir + "test1.edit");

        expect(editor.language).toEqual(language);
        expect(editor.getDefaultProjectiongroup()).not.toBeNull();
        language.concepts.filter(c => !(c instanceof PiLimitedConcept) && !(c instanceof PiBinaryExpressionConcept)).forEach(c => {
            const projections = editor.findProjectionsForType(c);
            expect(projections).not.toBeNull();
            expect(projections[0]).not.toBeNull();
        });
        language.units.forEach(u => {
            const projections = editor.findProjectionsForType(u);
            expect(projections).not.toBeNull();
            expect(projections[0]).not.toBeNull();
        });
    });
    test("boolean properties with one or two keywords have the right boolInfo", () => {
        const editor = readFile(testdir + "test2.edit");

        // test the first boolean prop, with just one keyword present
        let projections: PiEditClassifierProjection[] = editor.getDefaultProjectiongroup().findProjectionsForType(language.findClassifier("AAAAAA"));
        expect(projections).not.toBeNull();
        let first: PiEditClassifierProjection = projections[0];
        expect(first).not.toBeNull();
        if (first instanceof PiEditProjection ) {
            // find the projection of the boolean property
            let myBoolProjection: PiEditPropertyProjection = null;
            first.lines.forEach(line => {
                line.items.forEach(item => {
                    if (item instanceof PiEditPropertyProjection && item.property.name === "AAprop5") {
                        myBoolProjection = item;
                    }
                });
            });
            expect(myBoolProjection).not.toBeNull();
            expect(myBoolProjection.boolInfo).not.toBeNull();
            expect(myBoolProjection.boolInfo.trueKeyword).toBe("xxxx");
            expect(myBoolProjection.boolInfo.falseKeyword).toBeUndefined();
        }

        // test the second boolean prop, with two keywords present
        projections = editor.getDefaultProjectiongroup().findProjectionsForType(language.findClassifier("BB"));
        expect(projections).not.toBeNull();
        first = projections[0];
        expect(first).not.toBeNull();
        if (first instanceof PiEditProjection ) {
            // find the projection of the boolean property
            let myBoolProjection: PiEditPropertyProjection = null;
            first.lines.forEach(line => {
                line.items.forEach(item => {
                    if (item instanceof PiEditPropertyProjection && item.property.name === "BBprop5") {
                        myBoolProjection = item;
                    }
                });
            });
            expect(myBoolProjection).not.toBeNull();
            expect(myBoolProjection.boolInfo).not.toBeNull();
            expect(myBoolProjection.boolInfo.trueKeyword).toBe("aap");
            expect(myBoolProjection.boolInfo.falseKeyword).toBe("noot");
        }
    });
    test("all list properties have a listInfo with the correct values", () => {
        const editor = readFile(testdir + "test1.edit");

        expect(editor.language).toEqual(language);
        expect(editor.getDefaultProjectiongroup()).not.toBeNull();
        language.concepts.filter(c => !(c instanceof PiLimitedConcept) && !(c instanceof PiBinaryExpressionConcept)).forEach(c => {
            // TODO implement this
            // const projection = editor.findProjectionsForType(c);
            // expect(projection).not.toBeNull();
            // if (projection instanceof PiEditProjection ) {
            //     projection.lines.forEach(line => {
            //         line.items.forEach(item => {
            //             if (item instanceof PiEditPropertyProjection && item.property.referred.isList) {
            //                 myBoolProjection = item;
            //             }
            //         });
            //     });
            // }
        });
        language.units.forEach(u => {
            // const projection = editor.findProjectionsForType(u);
            // expect(projection).not.toBeNull();
        });
    });
    test("the default list info is vertical, with comma-separator", () => {

    });
    test("every list property has a list projection, even if only a table projection is defined", () => {

    });
});
