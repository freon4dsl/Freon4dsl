import { UndoModel, UndoPart, UndoUnit } from "../language/gen";
import { UndoTesterEnvironment } from "../config/gen/UndoTesterEnvironment";
import { FileHandler } from "../../utils/FileHandler";
import { PiDelta, PiTransactionDelta, PiUndoManager } from "@projectit/core";

const handler = new FileHandler();
const reader = UndoTesterEnvironment.getInstance().reader;
const writer = UndoTesterEnvironment.getInstance().writer;

function readUnitInTransaction(manager: PiUndoManager, filePath: string) {
    manager.cleanStacks();
    manager.startTransaction();
    const model: UndoModel = new UndoModel();
    const langSpec: string = handler.stringFromFile(filePath);
    const unit1 = reader.readFromString(langSpec, "UndoUnit", model) as UndoUnit;
    manager.endTransaction();
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
        expect (manager.undoStackPerUnit).not.toBeNull();
        expect (manager.undoStackPerUnit).not.toBeUndefined();
        const myStack = manager.undoStackPerUnit.get("myName");
        expect (myStack).not.toBeNull();
        expect (myStack).not.toBeUndefined();
        expect (myStack.length).toBe(6);
        // console.log("length of undo stack: " + myStack.length + " => [[\n\t" + myStack.map(d => d.toString() + "\n\t").join("") + "]]");
    });

    it("read First WITH transaction", () => {
        const manager = PiUndoManager.getInstance();
        const filePath = "src/UndoTester/__inputs__/First.und";
        const unit1 = readUnitInTransaction(manager, filePath);
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
            expect (delta.internalDeltas.length).toBe(6);
            // console.log("length of internal stack: " + delta.internalDeltas.length + " => [[" + delta.internalDeltas.map(d => d.toString() + "\n\t").join("") + "]]");
        }
    });

    it("change, undo, redo, undo on prim", () => {
        const manager = PiUndoManager.getInstance();
        const filePath = "src/UndoTester/__inputs__/first.und";
        const unit1 = readUnitInTransaction(manager, filePath);
        expect(unit1).not.toBeNull();
        // console.log(writer.writeToString(unit1));
        expect (manager.undoStackPerUnit).not.toBeNull();
        expect (manager.undoStackPerUnit).not.toBeUndefined();
        const undoStack: PiDelta[] = manager.undoStackPerUnit.get("myName");
        expect (undoStack).not.toBeNull();
        expect (undoStack).not.toBeUndefined();
        expect (undoStack.length).toBe(1);
        // console.log("length of undo stack: " + undoStack.length + " => [[" + undoStack.map(d => d.toString() + "\n\t").join("") + "]]");

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
        expect (undoStack.length).toBe(4); // read file (1), create prop of otherPart (2), set name in otherPart (3), set unit1.part (4)
        expect (unit1.part).toBe(otherPart);

        // undo the change
        manager.executeUndo(unit1);
        expect (undoStack.length).toBe(3);
        const redoStack: PiDelta[] = manager.redoStackPerUnit.get(unit1.name);
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
        const undoStack: PiDelta[] = manager.undoStackPerUnit.get("myName");
        expect (undoStack.length).toBe(1);

        // change the value of 'numlist'
        const oldValue = unit1.numlist[0];
        unit1.numlist[0] = 24;
        expect (undoStack.length).toBe(2);
        expect (unit1.numlist[0]).toBe(24);

        // undo the change
        manager.executeUndo(unit1);
        expect (undoStack.length).toBe(1);
        const redoStack: PiDelta[] = manager.redoStackPerUnit.get(unit1.name);
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
        const undoStack: PiDelta[] = manager.undoStackPerUnit.get("myName");
        expect (undoStack.length).toBe(1);

        // change the value of 'numlist'
        expect (unit1.numlist.length).toBe(3);
        const oldValue1 = unit1.numlist[0];
        const oldValue2 = unit1.numlist[1];
        const oldValue3 = unit1.numlist[2];
        unit1.numlist.splice(1, 2);
        expect (undoStack.length).toBe(2);
        expect (unit1.numlist.length).toBe(1);

        // undo the change
        manager.executeUndo(unit1);
        expect (undoStack.length).toBe(1);
        const redoStack: PiDelta[] = manager.redoStackPerUnit.get(unit1.name);
        expect (redoStack).not.toBeNull();
        expect (redoStack).not.toBeUndefined();
        expect (redoStack.length).toBe(1);
        expect (unit1.numlist.length).toBe(3);
        expect (unit1.numlist[0]).toBe(oldValue1);
        expect (unit1.numlist[1]).toBe(oldValue2);
        expect (unit1.numlist[2]).toBe(oldValue3);

        // redo the change
        manager.executeRedo(unit1);
        expect (undoStack.length).toBe(2);
        expect (unit1.numlist.length).toBe(1);
    });

    it("change, undo, redo, undo on an element in a list of parts", () => {
        const manager = PiUndoManager.getInstance();
        const filePath = "src/UndoTester/__inputs__/third.und";
        const unit1 = readUnitInTransaction(manager, filePath);
        expect(unit1).not.toBeNull();
        expect(unit1.partlist.length).toBe(5);
        const undoStack: PiDelta[] = manager.undoStackPerUnit.get("myName");
        expect (undoStack.length).toBe(1);

        // change the value of 'partlist'
        const oldValue = unit1.partlist[2];
        const newValue = new UndoPart("part90");
        unit1.partlist[2] = newValue;
        expect (undoStack.length).toBe(3); // creating newValue also results in delta, therefore '3' instead of '2'
        expect (unit1.partlist[2]).toBe(newValue);

        // undo the change
        manager.executeUndo(unit1);
        expect (undoStack.length).toBe(2);
        const redoStack: PiDelta[] = manager.redoStackPerUnit.get(unit1.name);
        expect (redoStack).not.toBeNull();
        expect (redoStack).not.toBeUndefined();
        expect (redoStack.length).toBe(1);
        expect (unit1.partlist[2]).toBe(oldValue);

        // redo the change
        manager.executeRedo(unit1);
        expect (unit1.partlist[2]).toBe(newValue);
    });

    it.skip("change, undo, redo, undo on multiple elements in a list of parts", () => {
        const manager = PiUndoManager.getInstance();
        const filePath = "src/UndoTester/__inputs__/third.und";
        const unit1 = readUnitInTransaction(manager, filePath);
        expect(unit1).not.toBeNull();
        expect(unit1.partlist.length).toBeGreaterThan(0);
        const undoStack: PiDelta[] = manager.undoStackPerUnit.get("myName");
        expect (undoStack.length).toBe(1);

        // change the value of 'partlist'
        expect (unit1.partlist.length).toBe(3);
        const oldValue1 = unit1.partlist[0];
        const oldValue2 = unit1.partlist[1];
        const oldValue3 = unit1.partlist[2];
        unit1.partlist.splice(1, 2);
        expect (undoStack.length).toBe(2);
        expect (unit1.partlist.length).toBe(1);

        // undo the change
        manager.executeUndo(unit1);
        expect (undoStack.length).toBe(1);
        const redoStack: PiDelta[] = manager.redoStackPerUnit.get(unit1.name);
        expect (redoStack).not.toBeNull();
        expect (redoStack).not.toBeUndefined();
        expect (redoStack.length).toBe(1);
        expect (unit1.partlist.length).toBe(3);
        expect (unit1.partlist[0]).toBe(oldValue1);
        expect (unit1.partlist[1]).toBe(oldValue2);
        expect (unit1.partlist[2]).toBe(oldValue3);

        // redo the change
        manager.executeRedo(unit1);
        expect (undoStack.length).toBe(2);
        expect (unit1.partlist.length).toBe(1);
    });
});
