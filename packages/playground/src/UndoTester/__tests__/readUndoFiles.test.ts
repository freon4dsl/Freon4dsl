import { UndoModel, UndoPart, UndoUnit } from "../language/gen";
import { UndoTesterEnvironment } from "../config/gen/UndoTesterEnvironment";
import { FileHandler } from "../../utils/FileHandler";
import { PiDelta, PiTransactionDelta, PiUndoManager } from "@projectit/core";

const handler = new FileHandler();
const reader = UndoTesterEnvironment.getInstance().reader;
// const writer = UndoTesterEnvironment.getInstance().writer;

function readUnitInTransaction(manager: PiUndoManager, filePath: string) {
    manager.cleanStacks(null);
    manager.startTransaction(null);
    const model: UndoModel = new UndoModel();
    const langSpec: string = handler.stringFromFile(filePath);
    const unit1 = reader.readFromString(langSpec, "UndoUnit", model) as UndoUnit;
    manager.endTransaction(null);
    return unit1;
}

describe("Testing Undo Manager", () => {

    it("read First WITHOUT transaction", () => {
        const manager = PiUndoManager.getInstance();
        const filePath = "src/UndoTester/__inputs__/First.und";
        const model: UndoModel = new UndoModel();
        const langSpec: string = handler.stringFromFile(filePath);
        const unit1 = reader.readFromString(langSpec, "UndoUnit", model) as UndoUnit;
        expect(unit1).not.toBeNull();
        // console.log(writer.writeToString(unit1));
        const myStack: PiDelta[] = manager.getUndoStackPerUnit(null);
        expect (myStack).not.toBeNull();
        expect (myStack).not.toBeUndefined();
        // console.log("length of undo stack: " + myStack.length + " => [[\n\t" + myStack.map(d => d.toString() + "\n\t").join("") + "]]");
        expect (myStack.length).toBe(1);
    });

    it("read First WITH transaction", () => {
        const manager = PiUndoManager.getInstance();
        const filePath = "src/UndoTester/__inputs__/First.und";
        const unit1 = readUnitInTransaction(manager, filePath);
        expect(unit1).not.toBeNull();
        // console.log(writer.writeToString(unit1));
        const myStack: PiDelta[] = manager.getUndoStackPerUnit(null);
        expect (myStack).not.toBeNull();
        expect (myStack).not.toBeUndefined();
        expect (myStack.length).toBe(1);
        const delta = myStack[0];
        expect (delta instanceof PiTransactionDelta).toBe(true);
        if (delta instanceof PiTransactionDelta) {
            console.log("length of internal stack: " + delta.internalDeltas.length + " => [[" + delta.internalDeltas.map(d => d.toString() + "\n\t").join("") + "]]");
            expect (delta.internalDeltas.length).toBe(1);
        }
    });

    it("change, undo, redo, undo on prim", () => {
        const manager = PiUndoManager.getInstance();
        const filePath = "src/UndoTester/__inputs__/first.und";
        const unit1 = readUnitInTransaction(manager, filePath);
        expect(unit1).not.toBeNull();
        // console.log(writer.writeToString(unit1));
        const undoStack: PiDelta[] = manager.getUndoStackPerUnit(unit1);
        expect (undoStack).not.toBeNull();
        expect (undoStack).not.toBeUndefined();

        // change the value of 'prim'
        unit1.prim = "nieuwe_waarde";
        expect (undoStack.length).toBe(1);
        expect (unit1.prim).toBe("nieuwe_waarde");
        // console.log("length of undo stack: " + undoStack.length + " => [[" + undoStack.map(d => d.toString() + "\n\t").join("") + "]]");

        // undo the change
        manager.executeUndo(unit1);
        const redoStack: PiDelta[] = manager.getRedoStackPerUnit(unit1);
        expect (redoStack).not.toBeNull();
        expect (redoStack).not.toBeUndefined();
        expect (redoStack.length).toBe(1);
        expect (undoStack.length).toBe(0);
        expect (unit1.prim).toBe("myText");
        // console.log("length of redo stack: " + redoStack.length + " => [[" + redoStack.map(d => d.toString()).join(", ") + "]]");

        // redo the change
        manager.executeRedo(unit1);
        expect (unit1.prim).toBe("nieuwe_waarde");
    });

    it("change, undo, redo, undo on part", () => {
        const manager = PiUndoManager.getInstance();
        const filePath = "src/UndoTester/__inputs__/second.und";
        const unit1 = readUnitInTransaction(manager, filePath);
        expect(unit1).not.toBeNull();
        // console.log(writer.writeToString(unit1));
        const undoStack: PiDelta[] = manager.getUndoStackPerUnit(unit1);
        expect (undoStack).not.toBeNull();
        expect (undoStack).not.toBeUndefined();

        // change the value of 'part'
        const oldPartId = unit1.part.piId(); // remember the id of the old value
        const otherPart = UndoPart.create({name: "part42"});
        const otherPartId = otherPart.piId();
        unit1.part = otherPart;
        // console.log("length of undo stack: " + undoStack.length + " => [[" + undoStack.map(d => d.toString()).join(", ") + "]]");
        expect (undoStack.length).toBe(1);
        expect (unit1.part).toBe(otherPart);

        // undo the change
        manager.executeUndo(unit1);
        expect (undoStack.length).toBe(0);
        const redoStack: PiDelta[] = manager.getRedoStackPerUnit(unit1);
        expect (redoStack).not.toBeNull();
        expect (redoStack).not.toBeUndefined();
        expect (redoStack.length).toBe(1);
        expect (unit1.part.piId()).toBe(oldPartId);

        // redo the change
        manager.executeRedo(unit1);
        expect (unit1.part).toBe(otherPart);
    });

    it("change, undo, redo, undo on an element in a list of primitives", () => {
        const manager = PiUndoManager.getInstance();
        const filePath = "src/UndoTester/__inputs__/first.und";
        const unit1 = readUnitInTransaction(manager, filePath);
        expect(unit1).not.toBeNull();
        expect(unit1.numlist.length).toBeGreaterThan(0);
        const undoStack: PiDelta[] = manager.getUndoStackPerUnit(unit1);
        expect (undoStack.length).toBe(0);

        // change the value of 'numlist'
        const oldValue = unit1.numlist[0];
        unit1.numlist[0] = 24;
        expect (undoStack.length).toBe(1);
        expect (unit1.numlist[0]).toBe(24);

        // undo the change
        manager.executeUndo(unit1);
        expect (undoStack.length).toBe(0);
        const redoStack: PiDelta[] = manager.getUndoStackPerUnit(unit1);
        expect (redoStack).not.toBeNull();
        expect (redoStack).not.toBeUndefined();
        expect (redoStack.length).toBe(1);
        expect (unit1.numlist[0]).toBe(oldValue);

        // redo the change
        manager.executeRedo(unit1);
        expect (unit1.numlist[0]).toBe(24);
    });

    it("change, undo, redo, undo on multiple elements in a list of primitives", () => {
        const manager = PiUndoManager.getInstance();
        const filePath = "src/UndoTester/__inputs__/second.und";
        const unit1 = readUnitInTransaction(manager, filePath);
        expect(unit1).not.toBeNull();
        expect(unit1.numlist.length).toBeGreaterThan(0);
        const undoStack: PiDelta[] = manager.getUndoStackPerUnit(unit1);
        expect (undoStack.length).toBe(0);

        // change the value of 'numlist'
        expect (unit1.numlist.length).toBe(3);
        const oldValue1 = unit1.numlist[0];
        const oldValue2 = unit1.numlist[1];
        const oldValue3 = unit1.numlist[2];
        unit1.numlist.splice(1, 2);
        expect (undoStack.length).toBe(1);
        expect (unit1.numlist.length).toBe(1);

        // undo the change
        manager.executeUndo(unit1);
        expect (undoStack.length).toBe(0);
        const redoStack: PiDelta[] = manager.getRedoStackPerUnit(unit1);
        expect (redoStack).not.toBeNull();
        expect (redoStack).not.toBeUndefined();
        expect (redoStack.length).toBe(1);
        expect (unit1.numlist.length).toBe(3);
        expect (unit1.numlist[0]).toBe(oldValue1);
        expect (unit1.numlist[1]).toBe(oldValue2);
        expect (unit1.numlist[2]).toBe(oldValue3);

        // redo the change
        manager.executeRedo(unit1);
        expect (undoStack.length).toBe(1);
        expect (unit1.numlist.length).toBe(1);
    });

    it("change, undo, redo, undo on an element in a list of parts", () => {
        const manager = PiUndoManager.getInstance();
        const filePath = "src/UndoTester/__inputs__/third.und";
        const unit1 = readUnitInTransaction(manager, filePath);
        expect(unit1).not.toBeNull();
        expect(unit1.partlist.length).toBe(5);
        const undoStack: PiDelta[] = manager.getUndoStackPerUnit(unit1);
        expect (undoStack.length).toBe(1);

        // change the value of 'partlist'
        const oldValue = unit1.partlist[2];
        const newValue = new UndoPart("part90");
        unit1.partlist[2] = newValue;
        expect (undoStack.length).toBe(2);
        expect (unit1.partlist[2]).toBe(newValue);

        // undo the change
        manager.executeUndo(unit1);
        expect (undoStack.length).toBe(1);
        const redoStack: PiDelta[] = manager.getRedoStackPerUnit(unit1);
        expect (redoStack).not.toBeNull();
        expect (redoStack).not.toBeUndefined();
        expect (redoStack.length).toBe(1);
        expect (unit1.partlist[2]).toBe(oldValue);

        // redo the change
        manager.executeRedo(unit1);
        expect (unit1.partlist[2]).toBe(newValue);
    });

    it("change, undo, redo, undo on multiple elements in a list of parts", () => {
        const manager = PiUndoManager.getInstance();
        const filePath = "src/UndoTester/__inputs__/third.und";
        const unit1 = readUnitInTransaction(manager, filePath);
        expect(unit1).not.toBeNull();
        expect(unit1.partlist.length).toBeGreaterThan(0);
        const undoStack: PiDelta[] = manager.getUndoStackPerUnit(unit1);
        expect (undoStack.length).toBe(1);

        // change the value of 'partlist'
        // console.log(unit1.partlist.map(p => p.name));
        expect (unit1.partlist.length).toBe(5);
        expect (unit1.piOwner()).not.toBeNull();
        expect (unit1.piOwner()).not.toBeUndefined();
        const oldValue1 = unit1.partlist[0];
        const oldValue2 = unit1.partlist[1];
        const oldValue3 = unit1.partlist[2];
        unit1.partlist.splice(1, 2);
        expect (undoStack.length).toBe(2);
        expect (unit1.partlist.length).toBe(3);

        // undo the change
        // console.log("length of undo stack: " + undoStack.length + " => [[" + undoStack.map(d => d.toString()).join(", ") + "]]");
        manager.executeUndo(unit1);
        expect (undoStack.length).toBe(1);
        const redoStack: PiDelta[] = manager.getRedoStackPerUnit(unit1);

        expect (redoStack).not.toBeNull();
        expect (redoStack).not.toBeUndefined();
        expect (redoStack.length).toBe(1);
        expect (unit1.partlist.length).toBe(5);
        expect (unit1.partlist[0]).toBe(oldValue1);
        expect (unit1.partlist[1]).toBe(oldValue2);
        expect (unit1.partlist[2]).toBe(oldValue3);

        // redo the change
        manager.executeRedo(unit1);
        expect (undoStack.length).toBe(2);
        expect (unit1.partlist.length).toBe(3);
    });
});
