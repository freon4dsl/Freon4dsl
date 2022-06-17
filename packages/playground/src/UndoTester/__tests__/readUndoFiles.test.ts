import { UndoModel, UndoUnit } from "../language/gen";
import { UndoTesterEnvironment } from "../config/gen/UndoTesterEnvironment";
import { FileHandler } from "../../utils/FileHandler";
import { PiDelta, PiUndoManager } from "@projectit/core";

const handler = new FileHandler();
const reader = UndoTesterEnvironment.getInstance().reader;
const writer = UndoTesterEnvironment.getInstance().writer;

describe("Testing Undo Manager", () => {

    test("read First WITHOUT transaction", () => {
        const manager = PiUndoManager.getInstance();
        const filePath = "src/UndoTester/__inputs__/First.und";
        const model: UndoModel = new UndoModel();
        const langSpec: string = handler.stringFromFile(filePath);
        const unit1 = reader.readFromString(langSpec, "UndoUnit", model) as UndoUnit;
        expect(unit1).not.toBeNull();
        // console.log(writer.writeToString(unit1));
        expect (manager.undoStackPerUnit).not.toBeNull();
        expect (manager.undoStackPerUnit).not.toBeUndefined();
        const myStack = manager.undoStackPerUnit.get("UndoUnit");
        expect (myStack).not.toBeNull();
        expect (myStack).not.toBeUndefined();
        expect (myStack.length).toBe(3);
        console.log("length of undo stack: " + myStack.length + " => [[" + myStack.map(d => d.toString()).join(", ") + "]]");
    });

    test("read First WITH transaction", () => {
        const manager = PiUndoManager.getInstance();
        manager.cleanStacks();
        manager.startTransaction();
        const filePath = "src/UndoTester/__inputs__/First.und";
        const model: UndoModel = new UndoModel();
        const langSpec: string = handler.stringFromFile(filePath);
        const unit1 = reader.readFromString(langSpec, "UndoUnit", model) as UndoUnit;
        manager.endTransaction();
        expect(unit1).not.toBeNull();
        // console.log(writer.writeToString(unit1));
        expect (manager.undoStackPerUnit).not.toBeNull();
        expect (manager.undoStackPerUnit).not.toBeUndefined();
        const myStack: PiDelta[] = manager.undoStackPerUnit.get("UndoUnit");
        expect (myStack).not.toBeNull();
        expect (myStack).not.toBeUndefined();
        // expect (myStack.length).toBe(1);
        console.log("length of undo stack: " + myStack.length + " => [[" + myStack.map(d => d.toString()).join(", ") + "]]");
    });

});
