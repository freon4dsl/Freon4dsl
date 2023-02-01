import { UndoModel, UndoPart, UndoUnit } from "../language/gen";
import { UndoTesterEnvironment } from "../config/gen/UndoTesterEnvironment";
import { FileHandler } from "../../utils/FileHandler";
import { FreUndoManager } from "@projectit/core";

const handler = new FileHandler();
const reader = UndoTesterEnvironment.getInstance().reader;
// const writer = UndoTesterEnvironment.getInstance().writer;

function readUnitInTransaction(manager: FreUndoManager, filePath: string) {
    manager.cleanAllStacks();
    manager.startTransaction();
    const model: UndoModel = new UndoModel();
    const langSpec: string = handler.stringFromFile(filePath);
    const unit1 = reader.readFromString(langSpec, "UndoUnit", model) as UndoUnit;
    manager.endTransaction();
    return unit1;
}

describe("Testing Undo Manager", () => {
    const manager = FreUndoManager.getInstance();

    it("change, undo, redo, undo on prim", () => {
        const filePath = "src/UndoTester/__inputs__/first.und";
        const unit1 = readUnitInTransaction(manager, filePath);
        expect(unit1).not.toBeNull();

        // change the value of 'prim'
        unit1.prim = "nieuwe_waarde";
        expect (unit1.prim).toBe("nieuwe_waarde");

        // undo the change
        manager.executeUndo(unit1);
        expect (unit1.prim).toBe("myText");

        // redo the change
        manager.executeRedo(unit1);
        expect (unit1.prim).toBe("nieuwe_waarde");
    });

    it("change, undo, redo, undo on part", () => {
        const filePath = "src/UndoTester/__inputs__/second.und";
        const unit1 = readUnitInTransaction(manager, filePath);
        expect(unit1).not.toBeNull();

        // change the value of 'part'
        const oldPartId = unit1.part.freId(); // remember the id of the old value
        const otherPart = UndoPart.create({name: "part42"});
        unit1.part = otherPart;
        expect (unit1.part).toBe(otherPart);

        // undo the change
        manager.executeUndo(unit1);
        expect (unit1.part.freId()).toBe(oldPartId);

        // redo the change
        manager.executeRedo(unit1);
        expect (unit1.part).toBe(otherPart);
    });

    it("change, undo, redo, undo on an element in a list of primitives", () => {
        const filePath = "src/UndoTester/__inputs__/first.und";
        const unit1 = readUnitInTransaction(manager, filePath);
        expect(unit1).not.toBeNull();
        expect(unit1.numlist.length).toBeGreaterThan(0);

        // change the value of 'numlist'
        const oldValue = unit1.numlist[0];
        unit1.numlist[0] = 24;
        expect (unit1.numlist[0]).toBe(24);

        // undo the change
        manager.executeUndo(unit1);
        expect (unit1.numlist[0]).toBe(oldValue);

        // redo the change
        manager.executeRedo(unit1);
        expect (unit1.numlist[0]).toBe(24);
    });

    it("change, undo, redo, undo on multiple elements in a list of primitives", () => {
        const filePath = "src/UndoTester/__inputs__/second.und";
        const unit1 = readUnitInTransaction(manager, filePath);
        expect(unit1).not.toBeNull();
        expect(unit1.numlist.length).toBeGreaterThan(0);

        // change the value of 'numlist'
        expect (unit1.numlist.length).toBe(3);
        const oldValue1 = unit1.numlist[0];
        const oldValue2 = unit1.numlist[1];
        const oldValue3 = unit1.numlist[2];
        unit1.numlist.splice(1, 2);
        expect (unit1.numlist.length).toBe(1);

        // undo the change
        manager.executeUndo(unit1);
        expect (unit1.numlist.length).toBe(3);
        expect (unit1.numlist[0]).toBe(oldValue1);
        expect (unit1.numlist[1]).toBe(oldValue2);
        expect (unit1.numlist[2]).toBe(oldValue3);

        // redo the change
        manager.executeRedo(unit1);
        expect (unit1.numlist.length).toBe(1);
    });

    it("change, undo, redo, undo on an element in a list of parts", () => {
        const filePath = "src/UndoTester/__inputs__/third.und";
        const unit1 = readUnitInTransaction(manager, filePath);
        expect(unit1).not.toBeNull();
        expect(unit1.partlist.length).toBe(5);

        // change the value of 'partlist'
        const oldValue = unit1.partlist[2];
        const newValue = new UndoPart("part90");
        unit1.partlist[2] = newValue;
        expect (unit1.partlist[2]).toBe(newValue);

        // undo the change
        manager.executeUndo(unit1);
        expect (unit1.partlist[2]).toBe(oldValue);

        // redo the change
        manager.executeRedo(unit1);
        expect (unit1.partlist[2]).toBe(newValue);
    });

    it("change, undo, redo, undo on multiple elements in a list of parts", () => {
        const manager = FreUndoManager.getInstance();
        const filePath = "src/UndoTester/__inputs__/third.und";
        const unit1 = readUnitInTransaction(manager, filePath);
        expect(unit1).not.toBeNull();
        expect(unit1.partlist.length).toBeGreaterThan(0);

        // change the value of 'partlist'
        // console.log(unit1.partlist.map(p => p.name));
        expect (unit1.partlist.length).toBe(5);
        expect (unit1.freOwner()).not.toBeNull();
        expect (unit1.freOwner()).not.toBeUndefined();
        const oldValue1 = unit1.partlist[0];
        const oldValue2 = unit1.partlist[1];
        const oldValue3 = unit1.partlist[2];
        unit1.partlist.splice(1, 2);
        expect (unit1.partlist.length).toBe(3);

        // undo the change
        // console.log("length of undo stack: " + undoStack.length + " => [[" + undoStack.map(d => d.toString()).join(", ") + "]]");
        manager.executeUndo(unit1);
        expect (unit1.partlist.length).toBe(5);
        expect (unit1.partlist[0]).toBe(oldValue1);
        expect (unit1.partlist[1]).toBe(oldValue2);
        expect (unit1.partlist[2]).toBe(oldValue3);

        // redo the change
        manager.executeRedo(unit1);
        expect (unit1.partlist.length).toBe(3);
    });
});
