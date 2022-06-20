import { UndoModel, UndoPart, UndoUnit } from "../language/gen";
import { UndoTesterEnvironment } from "../config/gen/UndoTesterEnvironment";
import { FileHandler } from "../../utils/FileHandler";
import { PiDelta, PiTransactionDelta, PiUndoManager } from "@projectit/core";

const handler = new FileHandler();
const reader = UndoTesterEnvironment.getInstance().reader;
const writer = UndoTesterEnvironment.getInstance().writer;

describe("Testing Undo Manager", () => {

    it("read First WITHOUT transaction", () => {
        const manager = PiUndoManager.getInstance();
        const filePath = "src/UndoTester/__inputs__/First.und";
        const model: UndoModel = new UndoModel();
        const langSpec: string = handler.stringFromFile(filePath);
        const unit1 = reader.readFromString(langSpec, "UndoUnit", model) as UndoUnit;
        expect(unit1).not.toBeNull();
        // console.log(writer.writeToString(unit1));
        expect (manager.undoStackPerUnit).not.toBeNull();
        expect (manager.undoStackPerUnit).not.toBeUndefined();
        const myStack = manager.undoStackPerUnit.get("myName");
        expect (myStack).not.toBeNull();
        expect (myStack).not.toBeUndefined();
        expect (myStack.length).toBe(3);
        // console.log("length of undo stack: " + myStack.length + " => [[" + myStack.map(d => d.toString()).join(", ") + "]]");
    });

    it("read First WITH transaction", () => {
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
        const myStack: PiDelta[] = manager.undoStackPerUnit.get("myName");
        expect (myStack).not.toBeNull();
        expect (myStack).not.toBeUndefined();
        expect (myStack.length).toBe(1);
        const delta = myStack[0];
        expect (delta instanceof PiTransactionDelta).toBe(true);
        if (delta instanceof PiTransactionDelta) {
            expect (delta.internalDeltas.length).toBe(3);
            // console.log("length of undo stack: " + delta.internalDeltas.length + " => [[" + delta.internalDeltas.map(d => d.toString()).join(", ") + "]]");
        }
    });

    it("change, undo, redo, undo on prim", () => {
        const manager = PiUndoManager.getInstance();
        manager.cleanStacks();
        manager.startTransaction();
        const filePath = "src/UndoTester/__inputs__/first.und";
        const model: UndoModel = new UndoModel();
        const langSpec: string = handler.stringFromFile(filePath);
        const unit1 = reader.readFromString(langSpec, "UndoUnit", model) as UndoUnit;
        manager.endTransaction();
        expect(unit1).not.toBeNull();
        // console.log(writer.writeToString(unit1));
        expect (manager.undoStackPerUnit).not.toBeNull();
        expect (manager.undoStackPerUnit).not.toBeUndefined();
        const undoStack: PiDelta[] = manager.undoStackPerUnit.get("myName");
        expect (undoStack).not.toBeNull();
        expect (undoStack).not.toBeUndefined();
        expect (undoStack.length).toBe(1);
        // console.log("length of undo stack: " + myStack.length + " => [[" + myStack.map(d => d.toString()).join(", ") + "]]");

        // change the value of 'prim'
        unit1.prim = "nieuwe_waarde";
        expect (undoStack.length).toBe(2);
        expect (unit1.prim).toBe("nieuwe_waarde");

        // undo the change
        manager.executeUndo(unit1);
        const redoStack: PiDelta[] = manager.redoStackPerUnit.get(unit1.name);
        expect (redoStack).not.toBeNull();
        expect (redoStack).not.toBeUndefined();
        expect (redoStack.length).toBe(1);
        expect (unit1.prim).toBe("myText");
        console.log("length of redo stack: " + redoStack.length + " => [[" + redoStack.map(d => d.toString()).join(", ") + "]]");

        // redo the change
        manager.executeRedo(unit1);
        expect (unit1.prim).toBe("nieuwe_waarde");
    });

    it("change, undo, redo, undo on part", () => {
        const manager = PiUndoManager.getInstance();
        manager.cleanStacks();
        manager.startTransaction();
        const filePath = "src/UndoTester/__inputs__/second.und";
        const model: UndoModel = new UndoModel();
        const langSpec: string = handler.stringFromFile(filePath);
        const unit1 = reader.readFromString(langSpec, "UndoUnit", model) as UndoUnit;
        manager.endTransaction();
        expect(unit1).not.toBeNull();
        // console.log(writer.writeToString(unit1));
        expect (manager.undoStackPerUnit).not.toBeNull();
        expect (manager.undoStackPerUnit).not.toBeUndefined();
        const undoStack: PiDelta[] = manager.undoStackPerUnit.get("myName");
        expect (undoStack).not.toBeNull();
        expect (undoStack).not.toBeUndefined();
        expect (undoStack.length).toBe(1);

        // change the value of 'part'
        const oldPartId = unit1.part.piId(); // remember the id of the old value
        const otherPart = UndoPart.create({name: "part42"});
        const otherPartId = otherPart.piId();
        unit1.part = otherPart;
        // console.log("length of undo stack: " + undoStack.length + " => [[" + undoStack.map(d => d.toString()).join(", ") + "]]");
        expect (undoStack.length).toBe(3); // read file (1), set name in otherPart (2), set unit1.part (3)
        expect (unit1.part).toBe(otherPart);

        // undo the change
        manager.executeUndo(unit1);
        expect (undoStack.length).toBe(2);
        const redoStack: PiDelta[] = manager.redoStackPerUnit.get(unit1.name);
        expect (redoStack).not.toBeNull();
        expect (redoStack).not.toBeUndefined();
        expect (redoStack.length).toBe(1);
        expect (unit1.part.piId()).toBe(oldPartId);

        // redo the change
        manager.executeRedo(unit1);
        expect (unit1.part).toBe(otherPart);
    });

});
