import { AST, FreLanguage } from "@freon4dsl/core";
import { TestStartEnvironment } from "../freon/config/TestStartEnvironment.js";
import { AA, BB, CC, KK, TestLimited, XX, ZZ } from "../freon/language/index.js";
import { TestStartStdlib } from "../freon/stdlib/TestStartStdlib.js";
import { describe, test, expect, beforeEach } from "vitest";
import { getVisibleNames } from '../../utils/HelperFunctions.js';

describe("Checking stdlib for Demo", () => {
    TestStartEnvironment.getInstance();
    let stdlib: TestStartStdlib = FreLanguage.getInstance().stdLib as TestStartStdlib;
    // The stdlib contains the following elements
    // ZZ.ZZinstance1
    // XX.XXinstance1
    // XX.XXinstance2
    // XX.XXinstance3
    // TestLimited.Object1
    // TestLimited.Object2
    // KK.CC1
    // KK.CC2

    test("all predefined instances of limited concepts should be found", () => {
        expect(stdlib.find("ONWAAR")).toBe(TestLimited.Object1);
        expect(stdlib.find("WAAR")).toBe(TestLimited.Object2);
        expect(stdlib.find("ZZinstance1")).toBe(ZZ.ZZinstance1);
        expect(stdlib.find("XXinstance1")).toBe(XX.XXinstance1);
        expect(stdlib.find("XXinstance2")).toBe(XX.XXinstance2);
        expect(stdlib.find("XXinstance3")).toBe(XX.XXinstance3);
        expect(stdlib.find("CC1")).toBe(KK.CC1);
        expect(stdlib.find("CC2")).toBe(KK.CC2);
        expect(stdlib.find("String")).toBeUndefined();
        expect(stdlib.find("Integer")).toBeUndefined();
        expect(stdlib.find("Boolean")).toBeUndefined();
        expect(stdlib.find("ANY")).toBeUndefined();
    });

    test("all predefined instances can be found including check on metatype", () => {
        expect(stdlib.find("ONWAAR", "TestLimited")).toBe(TestLimited.Object1);
        expect(stdlib.find("WAAR", "TestLimited")).toBe(TestLimited.Object2);
        expect(stdlib.find("ZZinstance1", "ZZ")).toBe(ZZ.ZZinstance1);
        expect(stdlib.find("XXinstance1", "XX")).toBe(XX.XXinstance1);
        expect(stdlib.find("XXinstance2", "XX")).toBe(XX.XXinstance2);
        expect(stdlib.find("XXinstance3", "XX")).toBe(XX.XXinstance3);
        expect(stdlib.find("CC1", "KK")).toBe(KK.CC1);
        expect(stdlib.find("CC2", "KK")).toBe(KK.CC2);
        expect(stdlib.find("String", "TestLimited")).toBeUndefined();
        expect(stdlib.find("Integer", "TestLimited")).toBeUndefined();
        expect(stdlib.find("Boolean", "TestLimited")).toBeUndefined();
        expect(stdlib.find("ANY", "TestLimited")).toBeUndefined();
        expect(stdlib.find("ONWAAR", "ZZ")).toBeUndefined();
        expect(stdlib.find("WAAR", "XX")).toBeUndefined();
        expect(stdlib.find("ZZinstance1", "KK")).toBeUndefined();
        expect(stdlib.find("XXinstance1", "TestLimited")).toBeUndefined();
        expect(stdlib.find("XXinstance2", "ZZ")).toBeUndefined();
        expect(stdlib.find("XXinstance3", "KK")).toBeUndefined();
        expect(stdlib.find("CC1", "XX")).toBeUndefined();
        expect(stdlib.find("CC2", "TestLimited")).toBeUndefined();
    });
});

describe("Checking scoper for testproject", () => {
    let model: BB;
    let super1: AA;
    let super2: AA;
    let stdlib: TestStartStdlib = FreLanguage.getInstance().stdLib as TestStartStdlib;
    let ZZinstance1: ZZ = stdlib.find("ZZinstance1", "ZZ") as ZZ;

    beforeEach(() => {
        AST.change( () => {
            model = new BB();
    
            super1 = new AA();
            super1.name = "super1";
            let myCC1 = new CC();
            myCC1.name = "myCC1";
            super1.AAprop21 = myCC1;
    
            let myCC2 = new CC();
            myCC2.name = "myCC2";
            super2 = new AA();
            super2.name = "super2";
            super2.AAprop21 = myCC2;
        })
    });

    test("all names in both super1 and super2 should be found", () => {
        AST.change( () => {
            model.supers.push(super1);
            model.supers.push(super2);
        })
        let scoper = TestStartEnvironment.getInstance().scoper;
        let vi = getVisibleNames(scoper.getVisibleNodes(model));
        expect(vi).toContain("super1");
        expect(vi).toContain("super2");
        expect(vi).toContain("myCC1");
        expect(vi).toContain("myCC2");
        expect(vi).toContain("ZZinstance1");
    });

    test("all names only from super2 should be found", () => {
        AST.change( () => {
            model.supers.push(super2);
        })
        let scoper = TestStartEnvironment.getInstance().scoper;
        let vi = getVisibleNames(scoper.getVisibleNodes(model));
        // expect(vi).toContain("super1");
        expect(vi).toContain("super2");
        // expect(vi).toContain("myCC1");
        expect(vi).toContain("myCC2");
        expect(vi).toContain("ZZinstance1");
    });

    test("all names only from super1 should be found", () => {
        AST.change( () => {
            model.supers.push(super1);
        })
        let scoper = TestStartEnvironment.getInstance().scoper;
        let vi = getVisibleNames(scoper.getVisibleNodes(model));
        expect(vi).toContain("super1");
        // expect(vi).toContain("super2");
        expect(vi).toContain("myCC1");
        // expect(vi).toContain("myCC2");
        expect(vi).toContain("ZZinstance1");
    });

    test("all elements in both super1 and super2 should be found", () => {
        AST.change( () => {
            model.supers.push(super1);
            model.supers.push(super2);
        })
        let scoper = TestStartEnvironment.getInstance().scoper;
        let vi = scoper.getVisibleNodes(model);
        expect(vi).toContain(super1);
        expect(vi).toContain(super2);
        expect(vi).toContain(super1.AAprop21); // myCC1
        expect(vi).toContain(super2.AAprop21); // myCC2
        expect(vi).toContain(ZZinstance1);
    });

    test("all elements only from super2 should be found", () => {
        AST.change( () => {
            model.supers.push(super2);
        })
        let scoper = TestStartEnvironment.getInstance().scoper;
        let vi = scoper.getVisibleNodes(model);
        expect(vi).not.toContain(super1);
        expect(vi).toContain(super2);
        expect(vi).not.toContain(super1.AAprop21); // myCC1
        expect(vi).toContain(super2.AAprop21); // myCC2
        expect(vi).toContain(ZZinstance1);
    });

    test("all elements only from super1 should be found", () => {
        AST.change( () => {
            model.supers.push(super1);
        })
        let scoper = TestStartEnvironment.getInstance().scoper;
        let vi = scoper.getVisibleNodes(model);
        expect(vi).toContain(super1);
        expect(vi).not.toContain(super2);
        expect(vi).toContain(super1.AAprop21); // myCC1
        expect(vi).not.toContain(super2.AAprop21); // myCC2
        expect(vi).toContain(ZZinstance1);
    });
});
