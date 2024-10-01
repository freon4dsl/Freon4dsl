import { FreNode, FreSearcher, FreNodeReference, FreModelUnit, AST } from "@freon4dsl/core";
import { FileHandler } from "../../utils/FileHandler";
import {
    AssociationClass,
    AssociationEnd,
    Attribute,
    IClassifier,
    MultiplicityKind,
    OctopusModel,
    UmlClass,
    UmlPart,
} from "../language/gen";
import { OctopusModelEnvironment } from "../config/gen/OctopusModelEnvironment";
import { describe, test, expect } from "vitest";

const writer = OctopusModelEnvironment.getInstance().writer;
const reader = OctopusModelEnvironment.getInstance().reader;
const handler = new FileHandler();
const searcher = new FreSearcher();

function readFile(filepath: string): FreModelUnit {
    try {
        AST.change( () => {
            const model: OctopusModel = new OctopusModel();
            const langSpec: string = handler.stringFromFile(filepath);
            return reader.readFromString(langSpec, "UmlPart", model) as FreModelUnit;
        })
    } catch (e) {
        console.log(e.message + e.stack);
    }
    return null;
}

describe("Testing Search Structure", () => {
    test("search all associations in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            const found: FreNode[] = searcher.findStructure({}, myUnit, "Association");
            expect(found.length).toBe(5);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search association '?.prevChap[1..?]' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            // make the partial to be found
            const toBeFound: FreNode = AssociationEnd.create({
                name: "prevChap",
                multiplicity: MultiplicityKind.create({ lowerBound: 1 }),
            });
            // search for it
            const found: FreNode[] = searcher.findStructure(toBeFound, myUnit, "AssociationEnd");
            expect(found.length).toBe(1);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search associationclass named 'ChapterDependency' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            // make the partial to be found
            const toBeFound: FreNode = AssociationClass.create({ name: "ChapterDependency" });
            // search for it
            const found: FreNode[] = searcher.findStructure(toBeFound, myUnit, "AssociationClass");
            expect(found.length).toBe(1);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search associationclass with attribute named 'sameAuthor' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            // make the partial to be found
            const attrToBeFound: Attribute = Attribute.create({ name: "sameAuthor" });
            const toBeFound: FreNode = AssociationClass.create({ attributes: [attrToBeFound] });
            // search for it
            const found: FreNode[] = searcher.findStructure(toBeFound, myUnit, "AssociationClass");
            expect(found.length).toBe(1);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search associationclass that has 'Chapter.?' as end in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            // make the partial to be found
            const refToBeFound: FreNodeReference<IClassifier> = FreNodeReference.create<IClassifier>(
                "Chapter",
                "IClassifier",
            );
            const endToBeFound: AssociationEnd = AssociationEnd.create({ baseType: refToBeFound });
            const toBeFound: FreNode = AssociationClass.create({ end1: endToBeFound });
            // search for it
            const found: FreNode[] = searcher.findStructure(toBeFound, myUnit, "AssociationClass");
            expect(found.length).toBe(1);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search class named 'Chapter' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            // make the partial to be found
            const toBeFound: FreNode = UmlClass.create({ name: "Chapter" });
            // search for it
            const found: FreNode[] = searcher.findStructure(toBeFound, myUnit, "UmlClass");
            expect(found.length).toBe(1);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search class named 'Chapter' with attribute 'autor' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            // make the partial to be found
            const attrToBeFound: Attribute = Attribute.create({ name: "autor" }); // typo in name!!!
            const toBeFound: FreNode = UmlClass.create({ name: "Chapter", attributes: [attrToBeFound] });
            // search for it
            const found: FreNode[] = searcher.findStructure(toBeFound, myUnit, "UmlClass");
            expect(found.length).toBe(0);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search attributes with type 'Boolean' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            // make the partial to be found
            const refToBeFound: FreNodeReference<IClassifier> = FreNodeReference.create<IClassifier>(
                "Boolean",
                "IClassifier",
            );
            const toBeFound: Attribute = Attribute.create({ type: refToBeFound });
            // search for it
            const found: FreNode[] = searcher.findStructure(toBeFound, myUnit, "Attribute");
            expect(found.length).toBe(3);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });
});
