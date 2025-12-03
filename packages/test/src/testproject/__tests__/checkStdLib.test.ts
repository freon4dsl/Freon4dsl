import { AST, FreLanguage } from "@freon4dsl/core";
import { KK, TestLimited, XX, ZZ } from "../freon/language/index.js";
import { TestStartEnvironment } from "../freon/config/TestStartEnvironment.js";
import { TestStartStdlib } from "../freon/stdlib/TestStartStdlib.js";
import { describe, test, expect } from "vitest";

describe("Checking stdlib for Demo", () => {
    let stdlib
    AST.change( () => {
        TestStartEnvironment.getInstance();
        stdlib = FreLanguage.getInstance().stdLib as TestStartStdlib;
    })
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

    test("all custom additions to the stdlib can be found", () => {
        expect(stdlib.find("EXTRA1", "AA")).not.toBeUndefined();
        expect(stdlib.find("EXTRA2", "AA")).not.toBeUndefined();
        expect(stdlib.find("EXTRA1", "BB")).not.toBeUndefined();
        expect(stdlib.find("EXTRA2", "BB")).not.toBeUndefined();
    });
});
