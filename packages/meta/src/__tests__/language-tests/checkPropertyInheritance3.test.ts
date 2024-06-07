import { LanguageParser } from "../../languagedef/parser/LanguageParser";
import { MetaLogger } from "../../utils";
import { FreMetaLanguage, FreMetaProperty } from "../../languagedef/metalanguage";
import { parseCorrectModel} from "./utils";


// The same tests as in property-inheritance1, only now all property types are interfaces
describe("Checking generation of virtual props", () => {
    const testdir = "src/__tests__/language-tests/faultyDefFiles/property-inheritance3/";
    const parser = new LanguageParser();
    MetaLogger.muteAllErrors();
    MetaLogger.muteAllLogs();

    // to be tested
    // 4. all props defined in implemented interfaces, that do not have a counterpart in the concept or its supers,
    //      should not have a name equal to any other, except when their types conform.
    // when types conform: add a new prop with the most specific type to classifier
    test("no counter parts", () => {
        const parseFile = testdir + "prop_test7.ast";
        const model = parseCorrectModel(parser, parseFile);
        // check the one primitive property
        const rightOne = model?.concepts.find(concept => concept.name === "Right");
        const found = rightOne.primProperties.find(prop => prop.name === "name1");
        expect(!!found).toEqual(true);
        expect(found.type.name).toBe("boolean");

        // check all other properties
        for (let index = 2; index < 5; index++) {
            const found2 = rightOne.properties.find(prop => prop.name === "name" + index);
            // console.log("found" + index + ": " + found?.name + ": " + found?.type.name);
            expect(!!found2).toEqual(true);
        }
        rightOne.properties.forEach(prop => {
            switch (prop.name) {
                case "name2": {
                    expect(prop.type.name).toBe("Type1");
                    break;
                }
                case "name3": {
                    expect(prop.type.name).toBe("Type2");
                    break;
                }
                case "name4": {
                    expect(prop.type.name).toBe("Type3");
                    break;
                }
            }
        });
    });

    test("with counterparts in concept", () => {
        const parseFile = testdir + "prop_test7a.ast";
        const model = parseCorrectModel(parser, parseFile);
        // check the one primitive property
        const rightOne = model?.concepts.find(concept => concept.name === "Right");
        const found = rightOne.primProperties.find(prop => prop.name === "name1");
        expect(!!found).toEqual(true);
        expect(found.type.name).toBe("boolean");

        // check all other properties
        for (let index = 2; index < 5; index++) {
            const found2 = rightOne.properties.find(prop => prop.name === "name" + index);
            // console.log("found" + index + ": " + found?.name + ": " + found?.type.name);
            expect(!!found2).toEqual(true);
        }
        rightOne.properties.forEach(prop => {
            switch (prop.name) {
                case "name2": {
                    expect(prop.type.name).toBe("Type1");
                    break;
                }
                case "name3": {
                    expect(prop.type.name).toBe("Type2");
                    break;
                }
                case "name4": {
                    expect(prop.type.name).toBe("Type3");
                    break;
                }
            }
        });
    });

    test("with counterparts in BASE concept", () => {
        const parseFile = testdir + "prop_test7b.ast";
        const model = parseCorrectModel(parser, parseFile);
        // check the one primitive property
        const rightOne = model?.concepts.find(concept => concept.name === "Right");
        let found = rightOne.primProperties.find(prop => prop.name === "name1");
        expect(!!found).toEqual(false);
        // the prim prop should be in 'RightBase'
        found = rightOne.base.referred.primProperties.find(prop => prop.name === "name1");
        expect(!!found).toEqual(true);
        expect(found.type.name).toBe("boolean");

        // check all other properties
        const otherProps: FreMetaProperty[] = [];
        for (let index = 2; index < 5; index++) {
            let found2 = rightOne.properties.find(prop => prop.name === "name" + index);
            expect(!!found2).toEqual(false);
            found2 = rightOne.base.referred.properties.find(prop => prop.name === "name" + index);
            expect(!!found2).toEqual(true);
            otherProps.push(found2);
        }
        otherProps.forEach(prop => {
            switch (prop.name) {
                case "name2": {
                    expect(prop.type.name).toBe("SuperType1");
                    break;
                }
                case "name3": {
                    expect(prop.type.name).toBe("SuperType2");
                    break;
                }
                case "name4": {
                    expect(prop.type.name).toBe("Type3");
                    break;
                }
            }
        });
    });
});
