import { AST, FreModelUnit, FreNode, FreSearcher } from "@freon4dsl/core";
import { AssociationEnd, Attribute, OctopusModel, UmlPart } from "../freon/language";
import { OctopusModelEnvironment } from "../freon/config/OctopusModelEnvironment";
import { FileHandler } from "../../utils/FileHandler";
import { describe, it, test, expect } from "vitest";

const writer = OctopusModelEnvironment.getInstance().writer;
const reader = OctopusModelEnvironment.getInstance().reader;
const handler = new FileHandler();
const searcher = new FreSearcher();

function readFile(filepath: string): FreModelUnit {
    let unit: FreModelUnit = null
    try {
        AST.change( () => {
            const model: OctopusModel = new OctopusModel();
            const langSpec: string = handler.stringFromFile(filepath);
            unit = reader.readFromString(langSpec, "UmlPart", model) as FreModelUnit;
        })
    } catch (e) {
        console.log(e.message + e.stack);
    }
    return unit;
}

describe("Testing Search String", () => {
    test("search associations with text '<-> + Ch' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            const found: FreNode[] = searcher.findString("<-> `+` `Chapter`", myUnit, writer, "Association");
            // console.log("Unit: \n" + writer.writeToString(myUnit));
            expect(found.length).toBe(2);
        } else {
            console.log("No unit to search");
        }
    });

    test("search '<-> + Ch' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            const found: FreNode[] = searcher.findString("<-> `+` `Ch", myUnit, writer);
            expect(found.length).toBe(3);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search 'Chapt' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            const found: FreNode[] = searcher.findString("Chapt", myUnit, writer);
            expect(found.length).toBe(8);
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
            expect(found.length).toBe(2);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search associationEnd with substring 'Chapter' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            // search for it
            const found: FreNode[] = searcher.findString("Chapter", myUnit, writer, "AssociationEnd");
            expect(found.length).toBe(6);
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
            expect(found.length).toBe(2);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });
});
