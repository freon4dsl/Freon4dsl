import { PiElement, StringSearcher } from "@projectit/core";
import {
    AssociationEnd,
    Attribute,
    OctopusModel,
    OctopusModelUnitType,
    UmlPart
} from "../language/gen";
import { OctopusEnvironment } from "../config/gen/OctopusEnvironment";
import { FileHandler } from "../../utils/FileHandler";


const writer = OctopusEnvironment.getInstance().writer;
const reader = OctopusEnvironment.getInstance().reader;
const handler = new FileHandler();
const searcher = new StringSearcher();

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

describe("Testing Search Element", () => {

    test("search associations with text '<-> + Ch' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        try {
            if (!!myUnit) {
                const found: PiElement[] = searcher.findElementWithSubString("<-> + Ch", myUnit, writer, "Association");
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
            const found: PiElement[] = searcher.findElementWithSubString("<-> + Ch", myUnit, writer);
            expect (found.length).toBe(3);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });

    test("search 'Chapt' in Book", () => {
        const myUnit = readFile("src/octopus-small/__inputs__/Book.uml2");
        if (!!myUnit) {
            const found: PiElement[] = searcher.findElementWithSubString("Chapt", myUnit, writer);
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
            const found: PiElement[] = searcher.findElementWithSubString("prevChap", myUnit, writer, "AssociationEnd");
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
            const found: PiElement[] = searcher.findElementWithSubString('Chapter', myUnit, writer, "AssociationEnd");
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
            const found: PiElement[] = searcher.findElementWithSubString("same", myUnit, writer, "Attribute");
            expect (found.length).toBe(2);
            // console.log("FOUND: \n\t" + found.map(f => writer.writeToString(f)).join("\n====\n\t"));
        } else {
            console.log("No unit to search");
        }
    });
});
