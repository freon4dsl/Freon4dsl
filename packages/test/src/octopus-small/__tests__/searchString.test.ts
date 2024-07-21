import { FreModelUnit, FreNode, FreSearcher } from "@freon4dsl/core";
import {
    AssociationEnd,
    Attribute,
    OctopusModel,
    UmlPart
} from "../language/gen";
import { OctopusModelEnvironment } from "../config/gen/OctopusModelEnvironment";
import { FileHandler } from "../../utils/FileHandler";
import { describe, it, test, expect } from "vitest"

const writer = OctopusModelEnvironment.getInstance().writer;
const reader = OctopusModelEnvironment.getInstance().reader;
const handler = new FileHandler();
const searcher = new FreSearcher();

function readFile(filepath: string): FreModelUnit {
    try {
        const model: OctopusModel = new OctopusModel();
        const langSpec: string = handler.stringFromFile(filepath);
        return reader.readFromString(langSpec, "UmlPart", model) as FreModelUnit;
    } catch (e) {
        console.log(e.message + e.stack);
    }
    return null;
}

describe("Testing Search String", () => {

    test("search associations with text '<-> + Ch' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        try {
            if (!!myUnit) {
                const found: FreNode[] = searcher.findString("<-> + Ch", myUnit, writer, "Association");
                expect(found.length).toBe(2);
                // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
            } else {
                console.log("No unit to search");
            }
        } catch (e) {
            console.log(e.stack)
        }
    });

    test("search '<-> + Ch' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            const found: FreNode[] = searcher.findString("<-> + Ch", myUnit, writer);
            expect (found.length).toBe(3);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search 'Chapt' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            const found: FreNode[] = searcher.findString("Chapt", myUnit, writer);
            expect (found.length).toBe(8);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search associationEnd with text 'prevChap' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            // search for it
            const found: FreNode[] = searcher.findString("prevChap", myUnit, writer, "AssociationEnd");
            expect (found.length).toBe(2);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search associationEnd with substring 'Chapter' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            // search for it
            const found: FreNode[] = searcher.findString('Chapter', myUnit, writer, "AssociationEnd");
            expect (found.length).toBe(6);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search attribute with substring 'same' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            // search for it
            const found: FreNode[] = searcher.findString("same", myUnit, writer, "Attribute");
            expect (found.length).toBe(2);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });
});
