import { FreBinaryExpressionConcept, FreClassifier, FreLanguage, FreLimitedConcept } from "../../languagedef/metalanguage";
import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { Checker, MetaLogger } from "../../utils";
import { FreEditParser } from "../../editordef/parser/FreEditParser";
import {
    ListJoinType,
    FreEditClassifierProjection,
    FreEditProjection, FreEditProjectionDirection,
    FreEditPropertyProjection,
    FreEditUnit
} from "../../editordef/metalanguage";
import { DefaultEditorGenerator } from "../../editordef/metalanguage/DefaultEditorGenerator";

describe("Checking PiEditUnit: ", () => {
    const testdir = "src/__tests__/editor-tests/correctDefFiles/";
    let parser: FreEditParser;
    let language: FreLanguage;
    let checker: Checker<FreEditUnit>;
    MetaLogger.muteAllErrors();
    MetaLogger.muteAllLogs();

    function readFile(parseFile: string): FreEditUnit {
        // read the language file (.ast)
        try {
            language = new LanguageParser().parse("src/__tests__/commonAstFiles/test-language.ast");
            parser = new FreEditParser(language);
            checker = parser.checker;
        } catch (e) {
            console.log("Language could not be read");
        }
        // read the .edit file
        let editor: FreEditUnit;
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
        language.concepts.filter(c => !(c instanceof FreLimitedConcept) && !(c instanceof FreBinaryExpressionConcept)).forEach(c => {
            const projections: FreEditClassifierProjection[] = editor.findProjectionsForType(c);
            expect(projections).not.toBeNull();
            expect(projections[0]).not.toBeNull();
        });
        language.units.forEach(u => {
            const projections: FreEditClassifierProjection[] = editor.findProjectionsForType(u);
            expect(projections).not.toBeNull();
            expect(projections[0]).not.toBeNull();
        });
    });

    test("in the generated default group: all list projections have a listInfo with the correct values", () => {
        const editor = readFile(testdir + "test1.edit");

        // the series of classifiers that we are testing here
        const classifiersToTest: FreClassifier[] = language.concepts.filter(c => !(c instanceof FreLimitedConcept) && !(c instanceof FreBinaryExpressionConcept));
        classifiersToTest.push(...language.units);

        classifiersToTest.forEach(c => {
            const projections: FreEditClassifierProjection[] = editor.findProjectionsForType(c);
            expect(projections).not.toBe([]);
            projections.forEach(proj => {
                if (proj instanceof FreEditProjection) {
                    proj.lines.forEach(line => {
                        line.items.forEach(item => {
                            if (item instanceof FreEditPropertyProjection && item.property.referred.isList) {
                                // the following tests the defaults added by DefaultEditorGenerator
                                expect(item.listInfo).not.toBeNull();
                                expect(item.listInfo.direction).toBe(FreEditProjectionDirection.Vertical);
                                expect(item.listInfo.joinType).toBe(ListJoinType.Separator);
                                expect(item.listInfo.joinText).toBe("");
                                expect(item.listInfo.isTable).toBe(false);
                            }
                        });
                    });
                }
            });
        });
    });

    test("in a non-generated group: all list properties have a listInfo", () => {
        const editor = readFile(testdir + "test2.edit");

        // the series of classifiers that we are testing here
        const classifiersToTest: FreClassifier[] = language.concepts.filter(c => !(c instanceof FreLimitedConcept) && !(c instanceof FreBinaryExpressionConcept));
        classifiersToTest.push(...language.units);

        // do the test
        classifiersToTest.forEach(c => {
            // find all property items in all projections of c
            const propItems: FreEditPropertyProjection[] = [];
            const projections: FreEditClassifierProjection[] = editor.findProjectionsForType(c);
            expect(projections).not.toBe([]);
            projections.forEach(proj => {
                if (proj instanceof FreEditProjection) {
                    proj.lines.forEach(line => {
                        line.items.forEach(item => {
                            if (item instanceof FreEditPropertyProjection) {
                                propItems.push(item);
                            }
                        })
                    })
                }
            });
            // check the property items against the list properties of c
            c.allProperties().filter(prop => prop.isList).forEach(prop => {
               const found: FreEditPropertyProjection[] = propItems.filter(item => item.property.referred === prop);
               found.forEach(item => {
                   // there are projections of this property, see if they are lists
                   expect(item.listInfo).not.toBeNull();
               })
            });
            // check the property items against the non-list properties of c
            c.allProperties().filter(prop => !prop.isList).forEach(prop => {
                const found: FreEditPropertyProjection[] = propItems.filter(item => item.property.referred === prop);
                found.forEach(item => {
                    // there are projections of this property, see if they are not lists
                    expect(item.listInfo).toBeNull();
                })
            });
        });
    });

    test("every list property has a list projection, even if only a table projection is defined", () => {
        const editor = readFile(testdir + "test3.edit");

        // the series of classifiers of which we are interested in its properties
        const classifiersToTest: FreClassifier[] = language.concepts.filter(c => !(c instanceof FreLimitedConcept) && !(c instanceof FreBinaryExpressionConcept));
        classifiersToTest.push(...language.units);

        classifiersToTest.forEach(c => {
            c.allProperties().filter(prop => prop.isList).forEach(prop => {
                // property type should have a non-table projection
                const propType = prop.type;
                if (!prop.isPrimitive && prop.isPart && !(propType instanceof FreLimitedConcept)) {
                    const projections: FreEditClassifierProjection[] = editor.findProjectionsForType(propType);
                    const xx = projections.find(proj => proj instanceof FreEditProjection);
                    // if (!xx)
                    // console.log("for none for prop '" + prop.name);
                    expect(xx).not.toBeNull();
                }
            });
        });

    });

    test("boolean properties with one or two keywords have the right boolInfo", () => {
        const editor = readFile(testdir + "test2.edit");

        // test the first boolean prop, with just one keyword present
        let projections: FreEditClassifierProjection[] = editor.getDefaultProjectiongroup().findProjectionsForType(language.findClassifier("AAAAAA"));
        expect(projections).not.toBeNull();
        let first: FreEditClassifierProjection = projections[0];
        expect(first).not.toBeNull();
        if (first instanceof FreEditProjection ) {
            // find the projection of the boolean property
            let myBoolProjection: FreEditPropertyProjection = null;
            first.lines.forEach(line => {
                line.items.forEach(item => {
                    if (item instanceof FreEditPropertyProjection && item.property.name === "AAprop5") {
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
        if (first instanceof FreEditProjection ) {
            // find the projection of the boolean property
            let myBoolProjection: FreEditPropertyProjection = null;
            first.lines.forEach(line => {
                line.items.forEach(item => {
                    if (item instanceof FreEditPropertyProjection && item.property.name === "BBprop5") {
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

    // TODO add tests for projections on interfaces
});
