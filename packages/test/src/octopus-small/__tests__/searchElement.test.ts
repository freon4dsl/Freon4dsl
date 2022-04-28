import { PiElement, Searcher } from "@projectit/core";
import { FileHandler } from "../../utils/FileHandler";
import {
    AssociationClass,
    AssociationEnd, Attribute, IClassifier,
    MultiplicityKind,
    OctopusModel,
    OctopusModelUnitType, PiElementReference, UmlClass,
    UmlPart
} from "../language/gen";
import { OctopusEnvironment } from "../config/gen/OctopusEnvironment";

const writer = OctopusEnvironment.getInstance().writer;
const reader = OctopusEnvironment.getInstance().reader;
const handler = new FileHandler();
const searcher = new Searcher();

function readFile(filepath: string): OctopusModelUnitType {
    try {
        const model: OctopusModel = new OctopusModel();
        const langSpec: string = handler.stringFromFile(filepath);
        return reader.readFromString(langSpec, "UmlPart", model) as OctopusModelUnitType;
    } catch (e) {
        console.log(e.message + e.stack);
    }
    return null;
}

describe("Testing Search Structure", () => {

    test("search all associations in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            const found: PiElement[] = searcher.findStructure(myUnit, {}, "Association");
            expect (found.length).toBe(5);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search association '?.prevChap[1..?]' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            // make the partial to be found
            const toBeFound: PiElement = AssociationEnd.create({ name: "prevChap", multiplicity: MultiplicityKind.create({ lowerBound: 1})});
            // search for it
            const found: PiElement[] = searcher.findStructure(myUnit, toBeFound, "AssociationEnd");
            expect (found.length).toBe(1);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search associationclass named 'ChapterDependency' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            // make the partial to be found
            const toBeFound: PiElement = AssociationClass.create({ name: 'ChapterDependency' });
            // search for it
            const found: PiElement[] = searcher.findStructure(myUnit, toBeFound, "AssociationClass");
            expect (found.length).toBe(1);
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
            const toBeFound: PiElement = AssociationClass.create({ attributes: [attrToBeFound] });
            // search for it
            const found: PiElement[] = searcher.findStructure(myUnit, toBeFound, "AssociationClass");
            expect (found.length).toBe(1);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search associationclass that has 'Chapter.?' as end in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            // make the partial to be found
            const refToBeFound: PiElementReference<IClassifier> = PiElementReference.create<IClassifier>("Chapter", "IClassifier");
            const endToBeFound: AssociationEnd = AssociationEnd.create({ baseType: refToBeFound });
            const toBeFound: PiElement = AssociationClass.create({ end1: endToBeFound });
            // search for it
            const found: PiElement[] = searcher.findStructure(myUnit, toBeFound, "AssociationClass");
            expect (found.length).toBe(1);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search class named 'Chapter' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            // make the partial to be found
            const toBeFound: PiElement = UmlClass.create({ name: "Chapter" });
            // search for it
            const found: PiElement[] = searcher.findStructure(myUnit, toBeFound, "UmlClass");
            expect (found.length).toBe(1);
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
            const toBeFound: PiElement = UmlClass.create({ name: "Chapter", attributes: [attrToBeFound] });
            // search for it
            const found: PiElement[] = searcher.findStructure(myUnit, toBeFound, "UmlClass");
            expect (found.length).toBe(0);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search attributes with type 'Boolean' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            // make the partial to be found
            const refToBeFound: PiElementReference<IClassifier> = PiElementReference.create<IClassifier>("Boolean", "IClassifier");
            const toBeFound: Attribute = Attribute.create({ type: refToBeFound });
            // search for it
            const found: PiElement[] = searcher.findStructure(myUnit, toBeFound, "Attribute");
            expect (found.length).toBe(3);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });
});
