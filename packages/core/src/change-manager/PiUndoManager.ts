import { PiChangeManager } from "./PiChangeManager";
import { PiModelUnit } from "../ast";
import { PiDelta, PiListDelta, PiPartDelta, PiPrimDelta, PiTransactionDelta } from "./PiDelta";
import { PiLogger } from "../logging";

const LOGGER: PiLogger = new PiLogger("PiUndoManager");
/**
 * Class PiUndoManager holds two sets of stacks of change information on the model.
 * The information is stored per model unit; one stack for undo info, one for redo info.
 */
export class PiUndoManager {
    private static theInstance; // the only instance of this class
    private inTransaction: boolean = false;
    private currentTransaction: PiTransactionDelta;
    private inUndo: boolean = false;

    /**
     * This method implements the singleton pattern
     */
    public static getInstance(): PiUndoManager {
        if (this.theInstance === undefined || this.theInstance === null) {
            this.theInstance = new PiUndoManager();
        }
        return this.theInstance;
    }

    public startTransaction() {
        this.inTransaction = true;
    }

    public endTransaction() {
        this.inTransaction = false;
        this.currentTransaction = null;
    }

    undoStackPerUnit: Map<string, PiDelta[]> = new Map<string, PiDelta[]>();
    redoStackPerUnit: Map<string, PiDelta[]> = new Map<string, PiDelta[]>();

    /**
     * A temporary method, because during testing we use the same manager
     */
    public cleanStacks() {
        this.undoStackPerUnit.clear();
        this.redoStackPerUnit.clear();
    }

    /**
     * Constructor is private, this implements the singleton pattern.
     * Constructor subscribes to all changes in the model.
     */
    private constructor() {
        PiChangeManager.getInstance().changePrimCallbacks.push(
            (delta: PiDelta) => this.addDelta(delta)
        );
        PiChangeManager.getInstance().changePartCallbacks.push(
            (delta: PiDelta) => this.addDelta(delta)
        );
        PiChangeManager.getInstance().changeListElemCallbacks.push(
            (delta: PiDelta) => this.addDelta(delta)
        );
        PiChangeManager.getInstance().changeListCallbacks.push(
            (delta: PiDelta) => this.addDelta(delta)
        );
    }

    private addDelta(delta: PiDelta) {
        if (this.inUndo) {
            this.addRedo(delta);
        } else {
            this.addUndo(delta);
        }
    }

    private addUndo(delta: PiDelta) {
        let myStack = this.undoStackPerUnit.get("myName");
        if (myStack === null || myStack === undefined) {
            this.undoStackPerUnit.set("myName", []);
            myStack = this.undoStackPerUnit.get("myName");
            // LOGGER.log("added stack for unit UndoUnit")
        }
        if (this.inTransaction) {
            if (this.currentTransaction === null || this.currentTransaction === undefined) {
                this.currentTransaction = new PiTransactionDelta(delta.owner, delta.propertyName, delta.index);
                myStack.push(this.currentTransaction);
            }
            this.currentTransaction.internalDeltas.push(delta);
            // console.log("PiUndoManager: IN TRANSACTION added undo for " + delta.owner.piLanguageConcept() + "[" + delta.propertyName + "]");
        } else {
            myStack.push(delta);
            // console.log("PiUndoManager: added undo for " + delta.owner.piLanguageConcept() + "[" + delta.propertyName + "]");
        }
    }

    private addRedo(delta: PiDelta) {
        // console.log("adding redo: " +delta.toString())
        let myStack = this.redoStackPerUnit.get("myName");
        if (myStack === null || myStack === undefined) {
            this.redoStackPerUnit.set("myName", []);
            myStack = this.redoStackPerUnit.get("myName");
            // LOGGER.log("added stack for unit UndoUnit")
        }
        if (this.inTransaction) {
            if (this.currentTransaction === null || this.currentTransaction === undefined) {
                this.currentTransaction = new PiTransactionDelta(delta.owner, delta.propertyName, delta.index);
                myStack.push(this.currentTransaction);
            }
            this.currentTransaction.internalDeltas.push(delta);
            // console.log("PiUndoManager: IN TRANSACTION added redo for " + delta.owner.piLanguageConcept() + "[" + delta.propertyName + "]");
        } else {
            myStack.push(delta);
            // console.log("PiUndoManager: added redo for " + delta.owner.piLanguageConcept() + "[" + delta.propertyName + "]");
        }
    }

    executeUndo(unit: PiModelUnit) {
        this.inUndo = true; // make sure incoming changes are stored on redo stack
        console.log("executing undo for unit: "+ unit.name)
        const delta = this.undoStackPerUnit.get(unit.name).pop();
        this.reverseDelta(delta, unit);
        this.inUndo = false;
    }

    executeRedo(unit: PiModelUnit) {
        const delta = this.redoStackPerUnit.get(unit.name).pop();
        this.reverseDelta(delta, unit);
    }

    private reverseDelta(delta: PiDelta, unit: PiModelUnit) {
        if (delta instanceof PiPrimDelta) {
            delta.owner[delta.propertyName] = delta.oldValue;
        } else if (delta instanceof PiPartDelta) {
            console.log("reverseDelta: " + delta.toString() + ", old value: " + delta.oldValue?.piId());
            delta.owner[delta.propertyName] = delta.oldValue;
        } else if (delta instanceof PiListDelta) {
            if (delta.removed.length > 0) {
                console.log("reverseDelta: elements that were removed: " + delta.removed )
            }
            if (delta.added.length > 0) {
                console.log("reverseDelta: elements that were added: " + delta.added)
            }
        } else if (delta instanceof PiTransactionDelta) {
            console.log("to be done: reverse of transaction");
        }
    }
}
