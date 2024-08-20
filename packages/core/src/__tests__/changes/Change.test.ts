import { UndoModel } from "./change-model/UndoModel";
import { UndoUnit } from "./change-model/UndoUnit";
import { UndoPart } from "./change-model/UndoPart";
import { FreDelta, FreTransactionDelta, FreUndoManager } from "../../change-manager";
import { FreModelUnit } from "../../ast";
import { describe, it, expect, beforeEach } from "vitest";

// expose the private parts of the undo manager for testing purposes only
function getUndoStackPerUnit(manager: FreUndoManager, unit?: FreModelUnit): FreDelta[] {
    if (!!unit) {
        return manager["undoManagerPerUnit"].get(unit.name)["undoStack"];
    } else {
        return manager["modelUndoManager"]["undoStack"];
    }
}

function getRedoStackPerUnit(manager: FreUndoManager, unit?: FreModelUnit): FreDelta[] {
    if (!!unit) {
        return manager["undoManagerPerUnit"].get(unit.name)["redoStack"];
    } else {
        return manager["modelUndoManager"]["redoStack"];
    }
}

describe("Change and Undo Manager", () => {
    let part1: UndoPart = null;
    let part2: UndoPart = null;
    let part3: UndoPart = null;
    let part4: UndoPart = null;
    let part5: UndoPart = null;
    let part6: UndoPart = null;
    let unit: UndoUnit = null;
    // let model: UndoModel = null;
    const manager = FreUndoManager.getInstance();

    beforeEach(() => {
        manager.cleanAllStacks();
        // create a simple model where some actions cannot be un-done and re-done
        part1 = UndoPart.create({ name: "part1" });
        part2 = UndoPart.create({ name: "part2" });
        part3 = UndoPart.create({ name: "part3" });
        part4 = UndoPart.create({ name: "part4" });
        part5 = UndoPart.create({ name: "part5" });
        part6 = UndoPart.create({ name: "part6" });
        unit = UndoUnit.create({
            name: "firstUndoUnit",
            prim: "myPrimText",
            numlist: [100, 200, 300],
            part: part1,
            partlist: [part2, part3, part4, part5, part6],
        });
        UndoModel.create({ unit: unit });
    });

    it("create model", () => {
        expect(unit).not.toBeNull();
        // console.log(writer.writeToString(unit));
        const myStack: FreDelta[] = getUndoStackPerUnit(manager);
        // console.log("length of undo stack: " + myStack.length + " => [[\n\t" + myStack.map(d => d.toString() + "\n\t").join("") + "]]");
        expect(myStack.length).toBe(1);
    });

    it("change, undo, redo, undo on prim", () => {
        // change the value of 'prim'
        unit.prim = "nieuwe_waarde";

        // get the stack after the change, before the result will be null/undefined!!
        const undoStack: FreDelta[] = getUndoStackPerUnit(manager, unit);
        expect(undoStack).not.toBeNull();
        expect(undoStack).not.toBeUndefined();
        expect(undoStack.length).toBe(1);
        expect(unit.prim).toBe("nieuwe_waarde");
        // console.log("length of undo stack: " + undoStack.length + " => [[" + undoStack.map(d => d.toString() + "\n\t").join("") + "]]");

        // undo the change
        manager.executeUndo(unit);
        const redoStack: FreDelta[] = getRedoStackPerUnit(manager, unit);
        expect(redoStack.length).toBe(1);
        expect(undoStack.length).toBe(0);
        expect(unit.prim).toBe("myPrimText");
        // console.log("length of redo stack: " + redoStack.length + " => [[" + redoStack.map(d => d.toString()).join(", ") + "]]");

        // redo the change
        manager.executeRedo(unit);
        expect(unit.prim).toBe("nieuwe_waarde");
    });

    it("change, undo, redo, undo on part", () => {
        // change the value of 'part'
        const oldPartId = unit.part.freId(); // remember the id of the old value
        const newPart = UndoPart.create({ name: "part42" });
        unit.part = newPart;

        const undoStack: FreDelta[] = getUndoStackPerUnit(manager, unit);
        expect(undoStack).not.toBeNull();
        expect(undoStack).not.toBeUndefined();
        // console.log("length of undo stack: " + undoStack.length + " => [[" + undoStack.map(d => d.toString()).join(", ") + "]]");
        expect(undoStack.length).toBe(1);
        expect(unit.part).toBe(newPart);

        // undo the change
        manager.executeUndo(unit);
        expect(undoStack.length).toBe(0);
        const redoStack: FreDelta[] = getRedoStackPerUnit(manager, unit);
        expect(redoStack.length).toBe(1);
        expect(unit.part.freId()).toBe(oldPartId);

        // redo the change
        manager.executeRedo(unit);
        expect(unit.part).toBe(newPart);
    });

    it("change, undo, redo, undo on an element in a list of primitives", () => {
        expect(unit.numlist.length).toBe(3);

        // change one of the values in 'numlist'
        const oldValue = unit.numlist[0];
        unit.numlist[0] = 24;
        const undoStack: FreDelta[] = getUndoStackPerUnit(manager, unit);
        expect(undoStack.length).toBe(1);
        expect(unit.numlist[0]).toBe(24);

        // undo the change
        manager.executeUndo(unit);
        expect(undoStack.length).toBe(0);
        const redoStack: FreDelta[] = getRedoStackPerUnit(manager, unit);
        expect(redoStack.length).toBe(1);
        expect(unit.numlist[0]).toBe(oldValue);

        // redo the change
        manager.executeRedo(unit);
        expect(unit.numlist[0]).toBe(24);
    });

    it("change, undo, redo, undo on multiple elements in a list of primitives", () => {
        // change the value of 'numlist'
        expect(unit.numlist.length).toBe(3);
        const oldValue1 = unit.numlist[0];
        const oldValue2 = unit.numlist[1];
        const oldValue3 = unit.numlist[2];
        unit.numlist.splice(1, 2);
        const undoStack: FreDelta[] = getUndoStackPerUnit(manager, unit);
        expect(undoStack.length).toBe(1);
        expect(unit.numlist.length).toBe(1);

        // undo the change
        manager.executeUndo(unit);
        expect(undoStack.length).toBe(0);
        const redoStack: FreDelta[] = getRedoStackPerUnit(manager, unit);
        expect(redoStack.length).toBe(1);
        expect(unit.numlist.length).toBe(3);
        expect(unit.numlist[0]).toBe(oldValue1);
        expect(unit.numlist[1]).toBe(oldValue2);
        expect(unit.numlist[2]).toBe(oldValue3);

        // redo the change
        manager.executeRedo(unit);
        expect(undoStack.length).toBe(1);
        expect(unit.numlist.length).toBe(1);
    });

    it("change, undo, redo, undo on an element in a list of parts", () => {
        expect(unit.partlist.length).toBe(5);

        // change the value of 'partlist'
        const oldValue = unit.partlist[2];
        const newValue = new UndoPart("part90");
        unit.partlist[2] = newValue;
        const undoStack: FreDelta[] = getUndoStackPerUnit(manager, unit);
        expect(undoStack.length).toBe(1);
        expect(unit.partlist[2]).toBe(newValue);

        // undo the change
        manager.executeUndo(unit);
        expect(undoStack.length).toBe(0);
        const redoStack: FreDelta[] = getRedoStackPerUnit(manager, unit);
        expect(redoStack.length).toBe(1);
        expect(unit.partlist[2]).toBe(oldValue);

        // redo the change
        manager.executeRedo(unit);
        expect(unit.partlist[2]).toBe(newValue);
    });

    it("change, undo, redo, undo on multiple elements in a list of parts", () => {
        // change the value of 'partlist'
        // console.log(unit.partlist.map(p => p.name));
        expect(unit.partlist.length).toBe(5);
        expect(unit.freOwner()).not.toBeNull();
        expect(unit.freOwner()).not.toBeUndefined();
        const oldValue1 = unit.partlist[0];
        const oldValue2 = unit.partlist[1];
        const oldValue3 = unit.partlist[2];
        unit.partlist.splice(1, 2);
        const undoStack: FreDelta[] = getUndoStackPerUnit(manager, unit);
        expect(undoStack.length).toBe(1);
        expect(unit.partlist.length).toBe(3);

        // undo the change
        // console.log("length of undo stack: " + undoStack.length + " => [[" + undoStack.map(d => d.toString()).join(", ") + "]]");
        manager.executeUndo(unit);
        expect(undoStack.length).toBe(0);
        const redoStack: FreDelta[] = getRedoStackPerUnit(manager, unit);
        expect(redoStack.length).toBe(1);
        expect(unit.partlist.length).toBe(5);
        expect(unit.partlist[0]).toBe(oldValue1);
        expect(unit.partlist[1]).toBe(oldValue2);
        expect(unit.partlist[2]).toBe(oldValue3);

        // redo the change
        manager.executeRedo(unit);
        expect(undoStack.length).toBe(1);
        expect(unit.partlist.length).toBe(3);
    });

    it("transaction: change, undo, redo, undo on multiple elements in a list of parts", () => {
        // make this a transaction
        manager.startTransaction(unit);

        // change the value of 'prim'
        unit.prim = "nieuwe_waarde";

        // change the value of 'part'
        // const oldPartId = unit.part.freId(); // remember the id of the old value
        unit.part = UndoPart.create({ name: "part42" });

        // change the value of 'partlist'
        expect(unit.partlist.length).toBe(5);
        expect(unit.freOwner()).not.toBeNull();
        expect(unit.freOwner()).not.toBeUndefined();
        const oldValue1 = unit.partlist[0];
        const oldValue2 = unit.partlist[1];
        const oldValue3 = unit.partlist[2];
        unit.partlist.splice(1, 2);
        expect(unit.partlist.length).toBe(3);

        // end the transaction
        manager.endTransaction(unit);

        // check the stack
        const undoStack: FreDelta[] = getUndoStackPerUnit(manager, unit);
        expect(undoStack.length).toBe(1);
        const delta = undoStack[0];
        expect(delta instanceof FreTransactionDelta).toBe(true);
        if (delta instanceof FreTransactionDelta) {
            // tslint:disable-next-line:max-line-length
            // console.log("length of internal stack: " + delta.internalDeltas.length + " => [[" + delta.internalDeltas.map(d => d.toString() + "\n\t").join("") + "]]");
            expect(delta.internalDeltas.length).toBe(3);
        }

        // undo the change
        // console.log("length of undo stack: " + undoStack.length + " => [[" + undoStack.map(d => d.toString()).join(", ") + "]]");
        manager.executeUndo(unit);
        expect(undoStack.length).toBe(0);
        const redoStack: FreDelta[] = getRedoStackPerUnit(manager, unit);
        expect(redoStack.length).toBe(1);
        expect(unit.partlist.length).toBe(5);
        expect(unit.partlist[0]).toBe(oldValue1);
        expect(unit.partlist[1]).toBe(oldValue2);
        expect(unit.partlist[2]).toBe(oldValue3);

        // redo the change
        manager.executeRedo(unit);
        expect(undoStack.length).toBe(1);
        expect(unit.partlist.length).toBe(3);
    });
});
