import {
    FreMetaBinaryExpressionConcept,
    FreMetaClassifier,
    FreMetaLanguage,
    FreMetaLimitedConcept
} from "../../languagedef/metalanguage/index.js";
import {LanguageParser} from "../../languagedef/parser/LanguageParser";
import {Checker, MetaLogger, Names} from "../../utils/index.js";
import {FreEditParser} from "../../editordef/parser/FreEditParser";
import {
    ForType,
    FreEditClassifierProjection,
    FreEditProjection,
    FreEditProjectionDirection,
    FreEditProjectionGroup,
    FreEditPropertyProjection,
    FreEditUnit,
    ListJoinType
} from "../../editordef/metalanguage/index.js";
import { DefaultEditorGenerator } from "../../editordef/metalanguage/DefaultEditorGenerator";
import { describe, test, expect } from "vitest";

describe("Checking FretEditUnit: ", () => {
    const testdir: string = "src/__tests__/editor-tests/correctDefFiles/";
    let parser: FreEditParser;
    let language: FreMetaLanguage | undefined;
    let checker: Checker<FreEditUnit>;
    MetaLogger.muteAllErrors();
    MetaLogger.muteAllLogs();

    function readFile(parseFile: string): FreEditUnit {
        // read the language file (.ast)
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
        // read the .edit file
        let editor: FreEditUnit | undefined;
        try {
            editor = parser.parse(parseFile);
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message + e.stack);
                console.log(checker.errors.map(err => `"${err}"`).join("\n"));
            }
        }
        if (editor !== null && editor !== undefined) {
            let defaultGroup: FreEditProjectionGroup | undefined = editor.getDefaultProjectiongroup();
            if (defaultGroup === null || defaultGroup === undefined) { // no default group, create one
                console.log("Creating new default group")
                defaultGroup = new FreEditProjectionGroup();
                defaultGroup.name = Names.defaultProjectionName;
                editor.projectiongroups.push(defaultGroup);
                defaultGroup.owningDefinition = editor;
            }
            DefaultEditorGenerator.addDefaults(editor);
        } else {
            throw new Error("No editor!!");
        }
        return editor;
    }

    test("all non-limited, non-binary expression concepts have a default-default projection and there is a default projection group", () => {
        const editor: FreEditUnit = readFile(testdir + "test1.edit");
        expect(language).not.toBeNull();
        expect(editor.language).toEqual(language);
        expect(editor.getDefaultProjectiongroup()).not.toBeNull();
        language!.concepts.filter(c => !(c instanceof FreMetaLimitedConcept) && !(c instanceof FreMetaBinaryExpressionConcept)).forEach(c => {
            const projections: FreEditClassifierProjection[] = editor.findProjectionsForType(c);
            expect(projections).not.toBeNull();
            expect(projections[0]).not.toBeNull();
        });
        language!.units.forEach(u => {
            const projections: FreEditClassifierProjection[] = editor.findProjectionsForType(u);
            expect(projections).not.toBeNull();
            expect(projections[0]).not.toBeNull();
        });
    });

    test("in the generated default group: all list projections have a listInfo with the correct values", () => {
        const editor = readFile(testdir + "test1.edit");
        expect(language).not.toBeNull();
        // the series of classifiers that we are testing here
        const classifiersToTest: FreMetaClassifier[] = language!.concepts
            .filter(c => !(c instanceof FreMetaLimitedConcept) && !(c instanceof FreMetaBinaryExpressionConcept));
        classifiersToTest.push(...language!.units);

        classifiersToTest.forEach(c => {
            const projections: FreEditClassifierProjection[] = editor.findProjectionsForType(c);
            expect(projections).not.toBe([]);
            projections.forEach(proj => {
                if (proj instanceof FreEditProjection) {
                    proj.lines.forEach(line => {
                        line.items.forEach(item => {
                            if (item instanceof FreEditPropertyProjection && item.property && item.property.referred.isList) {
                                // the following tests the defaults added by DefaultEditorGenerator
                                expect(item.listInfo).not.toBeNull();
                                expect(item.listInfo!.direction).toBe(FreEditProjectionDirection.Vertical);
                                expect(item.listInfo!.joinType).toBe(ListJoinType.Separator);
                                expect(item.listInfo!.joinText).toBe("");
                                expect(item.listInfo!.isTable).toBe(false);
                            }
                        });
                    });
                }
            });
        });
    });

    test("in a non-generated group: all list properties have a listInfo", () => {
        const editor = readFile(testdir + "test2.edit");
        expect(language).not.toBeNull();
        // the series of classifiers that we are testing here
        const classifiersToTest: FreMetaClassifier[] = language!.concepts
            .filter(c => !(c instanceof FreMetaLimitedConcept) && !(c instanceof FreMetaBinaryExpressionConcept));
        classifiersToTest.push(...language!.units);

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
                        });
                    });
                }
            });
            // check the property items against the list properties of c
            c.allProperties().filter(prop => prop.isList).forEach(prop => {
               const found: FreEditPropertyProjection[] = propItems.filter(item => item.property?.referred === prop);
               found.forEach(item => {
                   // there are projections of this property, see if they are lists
                   expect(item.listInfo).not.toBeNull();
               });
            });
            // check the property items against the non-list properties of c
            c.allProperties().filter(prop => !prop.isList).forEach(prop => {
                const found: FreEditPropertyProjection[] = propItems.filter(item => item.property?.referred === prop);
                found.forEach(item => {
                    // there are projections of this property, see if they are not lists
                    expect(item.listInfo).toBeUndefined();
                });
            });
        });
    });

    test("every list property has a list projection, even if only a table projection is defined", () => {
        const editor = readFile(testdir + "test3.edit");
        expect(language).not.toBeNull();
        // the series of classifiers of which we are interested in its properties
        const classifiersToTest: FreMetaClassifier[] = language!.concepts
            .filter(c => !(c instanceof FreMetaLimitedConcept) && !(c instanceof FreMetaBinaryExpressionConcept));
        classifiersToTest.push(...language!.units);

        classifiersToTest.forEach(c => {
            c.allProperties().filter(prop => prop.isList).forEach(prop => {
                // property type should have a non-table projection
                const propType = prop.type;
                if (!prop.isPrimitive && prop.isPart && !(propType instanceof FreMetaLimitedConcept)) {
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
        expect(language).not.toBeNull();
        expect(language).not.toBeUndefined();
        const defProjGroup: FreEditProjectionGroup | undefined = editor.getDefaultProjectiongroup();
        expect(defProjGroup).not.toBeNull();
        expect(defProjGroup).not.toBeUndefined();
        // test the first boolean prop, with just one keyword present
        const aaCls: FreMetaClassifier | undefined = language!.findClassifier("AAAAAA");
        expect(aaCls).not.toBeNull();
        expect(aaCls).not.toBeUndefined();
        let projections: FreEditClassifierProjection[] = defProjGroup!.findProjectionsForType(language!.findClassifier("AAAAAA")!);
        expect(projections).not.toBeNull();
        expect(projections).not.toBeUndefined();
        let first: FreEditClassifierProjection = projections[0];
        expect(first).not.toBeNull();
        expect(first).not.toBeUndefined();
        if (first instanceof FreEditProjection ) {
            // find the projection of the boolean property
            let myBoolProjection: FreEditPropertyProjection | undefined = undefined;
            first.lines.forEach(line => {
                line.items.forEach(item => {
                    if (item instanceof FreEditPropertyProjection && item.property && item.property.name === "AAprop5") {
                        myBoolProjection = item;
                    }
                });
            });
            expect(myBoolProjection).not.toBeNull();
            expect(myBoolProjection).not.toBeUndefined();
            expect(myBoolProjection!.boolKeywords).not.toBeUndefined();
            expect(myBoolProjection!.boolKeywords!.trueKeyword).toBe("xxxx");
            expect(myBoolProjection!.boolKeywords!.falseKeyword).toBeUndefined();
        }

        // test the second boolean prop, with two keywords present
        const bbCls: FreMetaClassifier | undefined = language!.findClassifier("BB");
        expect(bbCls).not.toBeNull();
        expect(bbCls).not.toBeUndefined();
        projections = defProjGroup!.findProjectionsForType(language!.findClassifier("BB")!);
        expect(projections).not.toBeNull();
        expect(projections).not.toBeUndefined();
        first = projections[0];
        expect(first).not.toBeNull();
        expect(first).not.toBeUndefined();
        if (first instanceof FreEditProjection ) {
            // find the projection of the boolean property
            let myBoolProjection: FreEditPropertyProjection | undefined = undefined;
            first.lines.forEach(line => {
                line.items.forEach(item => {
                    if (item instanceof FreEditPropertyProjection && item.property && item.property.name === "BBprop5") {
                        myBoolProjection = item;
                    }
                });
            });
            expect(myBoolProjection).not.toBeNull();
            expect(myBoolProjection).not.toBeUndefined();
            expect(myBoolProjection!.boolKeywords).not.toBeNull();
            expect(myBoolProjection!.boolKeywords).not.toBeUndefined();
            expect(myBoolProjection!.boolKeywords!.trueKeyword).toBe("aap");
            expect(myBoolProjection!.boolKeywords!.falseKeyword).toBe("noot");
        }
    });

    test("the reference separator has the right value", () => {
        const editor = readFile(testdir + "test4.edit");
        expect(language).not.toBeNull();
        expect(language).not.toBeUndefined();
        const defProjGroup: FreEditProjectionGroup | undefined = editor.getDefaultProjectiongroup();
        expect(defProjGroup).not.toBeNull();
        expect(defProjGroup).not.toBeUndefined();
        // get the reference separator and check it
        let myRef: string | undefined = defProjGroup!.findStandardProjFor(ForType.ReferenceSeparator)?.separator;
        expect(myRef).not.toBeNull();
        expect(myRef).not.toBeUndefined();
        expect(myRef).toBe(":::");
    });

    // TODO add tests for projections on interfaces
});
