import { FreModelUnit, FreNode, FreSearcher } from "@freon4dsl/core";
import { FileHandler } from "../../utils/FileHandler";
import {
    AssociationEnd,
    OctopusModel,
    UmlPart
} from "../language/gen";
import { OctopusModelEnvironment } from "../config/gen/OctopusModelEnvironment";
import { describe, test, expect } from "vitest"

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

describe("Testing Search NamedElement", () => {

    test("search elements named 'customer' or 'Customer' in orders", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/orders.uml2");
        if (!!myUnit) {
            const found: FreNode[] = searcher.findNamedElementNotCaseSensitive("customer", myUnit);
            expect (found.length).toBe(3);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search elements named 'customer' in orders", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/orders.uml2");
        if (!!myUnit) {
            const found: FreNode[] = searcher.findNamedElement("customer", myUnit);
            expect (found.length).toBe(2);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search elements named 'kind' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            const found: FreNode[] = searcher.findNamedElement("kind", myUnit);
            expect (found.length).toBe(2);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search 'twoColumn' in Book, with and without metatype", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            let found: FreNode[] = searcher.findNamedElement("twoColumn", myUnit, "AssociationEnd");
            expect(found.length).toBe(0);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
            found = searcher.findNamedElement("twoColumn", myUnit);
            expect(found.length).toBe(1);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
            found = searcher.findNamedElement("twoColumn", myUnit, "Attribute");
            expect(found.length).toBe(1);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });
});
