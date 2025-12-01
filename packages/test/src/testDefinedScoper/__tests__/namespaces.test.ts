import { FreLanguage } from "@freon4dsl/core";
import { DSmodelEnvironment } from "../freon/config/DSmodelEnvironment";
import { describe, test, expect } from "vitest";

describe("Testing Defined Scoper, namespaces for implemented interfaces", () => {
    const environment = DSmodelEnvironment.getInstance(); // needed to initialize Language, which is needed in the serializer

    /**
     * Test all kinds of direct and indirect namespace inheritance,
     * both through implemented interfaces as through base concepts.
     */
    test("Implemented namespace", () => {
        expect(FreLanguage.getInstance().concept("InheritNamespaceDirect").isNamespace).equals(true)
        expect(FreLanguage.getInstance().concept("InheritNamespaceIndirect").isNamespace).toBe(true)
        expect(FreLanguage.getInstance().concept("InheritNamespaceDirectThroughConcept").isNamespace).toBe(true)
        expect(FreLanguage.getInstance().concept("InheritNamespaceIndirectThroughConcept").isNamespace).toBe(true)
        expect(FreLanguage.getInstance().concept("NoNamespace").isNamespace).toBe(false)
        expect(FreLanguage.getInstance().concept("NamespaceConcept").isNamespace).toBe(true)
        expect(FreLanguage.getInstance().concept("NoNamespace").isNamespace).toBe(false)
        expect(FreLanguage.getInstance().concept("InheritDirectFromConcept").isNamespace).toBe(true)
        expect(FreLanguage.getInstance().concept("InheritIndirectFromConcept").isNamespace).toBe(true)
    });
});
