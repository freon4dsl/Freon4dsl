import { FreLanguage } from "@freon4dsl/core";
import { AllEnvironment } from "../freon/config/AllEnvironment.js";
import { LimitedConcept1, LimitedWithBase, LimitedWithInheritanceTree, LimitedWithInterface } from "../freon/language/index.js";
import { AllStdlib } from "../freon/stdlib/AllStdlib.js";
import { describe, it, test, expect } from "vitest";

describe("Checking stdlib for Lang Constructs", () => {
    AllEnvironment.getInstance();
    let stdlib: AllStdlib = FreLanguage.getInstance().stdLib as AllStdlib;
    // The stdlib contains the following elements
    // LimitedConcept1.FIRST
    // LimitedConcept1.SECOND
    // LimitedConcept1.THIRD
    // LimitedConcept1.FOURTH
    // LimitedWithBase.eersteB
    // LimitedWithBase.tweedeB
    // LimitedWithBase.derdeB
    // LimitedWithBase.FIFTH
    // LimitedWithInheritanceTree.TREE1
    // LimitedWithInheritanceTree.TREE2
    // LimitedWithInheritanceTree.SIXTH
    // LimitedWithInterface.limIntf1
    // LimitedWithInterface.limIntf2

    test("all predefined instances of limited concepts should be found", () => {
        expect(stdlib.find("FIRST")).toBe(LimitedConcept1.FIRST);
        expect(stdlib.find("SECOND")).toBe(LimitedConcept1.SECOND);
        expect(stdlib.find("THIRD")).toBe(LimitedConcept1.THIRD);
        expect(stdlib.find("FOURTH")).toBe(LimitedConcept1.FOURTH);
        expect(stdlib.find("FIFTH")).toBe(LimitedWithBase.FIFTH);
        expect(stdlib.find("SIXTH")).toBe(LimitedWithInheritanceTree.SIXTH);
        expect(stdlib.find("eersteB")).toBe(LimitedWithBase.eersteB);
        expect(stdlib.find("tweedeB")).toBe(LimitedWithBase.tweedeB);
        expect(stdlib.find("derdeB")).toBe(LimitedWithBase.derdeB);
        expect(stdlib.find("TREE1")).toBe(LimitedWithInheritanceTree.TREE1);
        expect(stdlib.find("TREE2")).toBe(LimitedWithInheritanceTree.TREE2);
        expect(stdlib.find("THIRD")).toBe(LimitedWithInheritanceTree.THIRD);
        expect(stdlib.find("limIntf1")).toBe(LimitedWithInterface.limIntf1);
        expect(stdlib.find("limIntf2")).toBe(LimitedWithInterface.limIntf2);
    });

    test("all predefined instances can be found including check on metatype", () => {
        expect(stdlib.find("FIRST", "LimitedConcept1")).toBe(LimitedConcept1.FIRST);
        expect(stdlib.find("SECOND", "LimitedConcept1")).toBe(LimitedConcept1.SECOND);
        expect(stdlib.find("THIRD", "LimitedConcept1")).toBe(LimitedConcept1.THIRD);
        expect(stdlib.find("FOURTH", "LimitedConcept1")).toBe(LimitedConcept1.FOURTH);
        expect(stdlib.find("FIFTH", "LimitedWithBase")).toBe(LimitedWithBase.FIFTH);
        expect(stdlib.find("SIXTH", "LimitedWithInheritanceTree")).toBe(LimitedWithInheritanceTree.SIXTH);
        expect(stdlib.find("eersteB", "LimitedWithBase")).toBe(LimitedWithBase.eersteB);
        expect(stdlib.find("tweedeB", "LimitedWithBase")).toBe(LimitedWithBase.tweedeB);
        expect(stdlib.find("derdeB", "LimitedWithBase")).toBe(LimitedWithBase.derdeB);
        expect(stdlib.find("TREE1", "LimitedWithInheritanceTree")).toBe(LimitedWithInheritanceTree.TREE1);
        expect(stdlib.find("TREE2", "LimitedWithInheritanceTree")).toBe(LimitedWithInheritanceTree.TREE2);
        expect(stdlib.find("limIntf1", "LimitedWithInterface")).toBe(LimitedWithInterface.limIntf1);
        expect(stdlib.find("limIntf2", "LimitedWithInterface")).toBe(LimitedWithInterface.limIntf2);
    });

    test("all predefined instances can be found with metatype inheritance", () => {
        expect(stdlib.find("eersteB", "LimitedConcept1")).toBe(LimitedWithBase.eersteB);
        expect(stdlib.find("tweedeB", "LimitedConcept1")).toBe(LimitedWithBase.tweedeB);
        expect(stdlib.find("derdeB", "LimitedConcept1")).toBe(LimitedWithBase.derdeB);
        expect(stdlib.find("FIFTH", "LimitedConcept1")).toBe(LimitedWithBase.FIFTH);
        expect(stdlib.find("TREE1", "LimitedConcept1")).toBe(LimitedWithInheritanceTree.TREE1);
        expect(stdlib.find("TREE2", "LimitedConcept1")).toBe(LimitedWithInheritanceTree.TREE2);
        expect(stdlib.find("SIXTH", "LimitedConcept1")).toBe(LimitedWithInheritanceTree.SIXTH);
        expect(stdlib.find("TREE1", "LimitedWithBase")).toBe(LimitedWithInheritanceTree.TREE1);
        expect(stdlib.find("TREE2", "LimitedWithBase")).toBe(LimitedWithInheritanceTree.TREE2);
        expect(stdlib.find("SIXTH", "LimitedWithBase")).toBe(LimitedWithInheritanceTree.SIXTH);
        expect(stdlib.find("limIntf1", "InterfaceWithPrimProps")).toBe(LimitedWithInterface.limIntf1);
        expect(stdlib.find("limIntf2", "InterfaceWithPrimProps")).toBe(LimitedWithInterface.limIntf2);
    });

    test("finding predefined instances with wrong metatype should return null", () => {
        expect(stdlib.find("FIRST", "LimitedWithInterface")).toBeUndefined();
        expect(stdlib.find("SECOND", "LimitedWithInterface")).toBeUndefined();
        expect(stdlib.find("THIRD", "LimitedWithInterface")).toBeUndefined();
        expect(stdlib.find("FOURTH", "LimitedWithInterface")).toBeUndefined();
        expect(stdlib.find("eersteB", "LimitedWithInterface")).toBeUndefined();
        expect(stdlib.find("tweedeB", "LimitedWithInterface")).toBeUndefined();
        expect(stdlib.find("derdeB", "LimitedWithInterface")).toBeUndefined();
        expect(stdlib.find("FOURTH", "LimitedWithInterface")).toBeUndefined();
        expect(stdlib.find("TREE1", "LimitedWithInterface")).toBeUndefined();
        expect(stdlib.find("TREE2", "LimitedWithInterface")).toBeUndefined();
        expect(stdlib.find("THIRD", "LimitedWithInterface")).toBeUndefined();
        expect(stdlib.find("limIntf1", "LimitedWithInheritanceTree")).toBeUndefined();
        expect(stdlib.find("limIntf2", "LimitedConcept1")).toBeUndefined();
    });

    test("all predefined instances with base metatype should not be found", () => {
        expect(stdlib.find("FIRST", "LimitedWithBase")).toBeUndefined;
        expect(stdlib.find("SECOND", "LimitedWithBase")).toBeUndefined;
        expect(stdlib.find("THIRD", "LimitedWithBase")).toBeUndefined;
        expect(stdlib.find("FOURTH", "LimitedWithBase")).toBeUndefined;
        expect(stdlib.find("eersteB", "LimitedWithInheritanceTree")).toBeUndefined();
        expect(stdlib.find("tweedeB", "LimitedWithInheritanceTree")).toBeUndefined();
        expect(stdlib.find("derdeB", "LimitedWithInheritanceTree")).toBeUndefined();
        expect(stdlib.find("FIFTH", "LimitedWithInterface")).toBeUndefined();
        expect(stdlib.find("TREE1", "LimitedWithInterface")).toBeUndefined();
        expect(stdlib.find("TREE2", "LimitedWithInterface")).toBeUndefined();
        expect(stdlib.find("SIXTH", "LimitedWithInterface")).toBeUndefined();
    });
});
