import { PiChangeManager } from "./PiChangeManager";
import { PiModelUnit } from "../ast";
import { PiDelta, PiPartListDelta, PiPartDelta, PiPrimDelta, PiTransactionDelta, PiPrimListDelta } from "./PiDelta";
import { PiLogger } from "../logging";

const LOGGER: PiLogger = new PiLogger("PiUndoManager");
/**
 * Class PiUndoManager holds two sets of stacks of change information on the model.
 * The information is stored per model unit; one stack for undo info, one for redo info.
 */
export class PiUndoManager {
    private static theInstance; // the only instance of this class
    private inIgnoreState: boolean = false;
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

    public startIgnore() {
        this.inIgnoreState = true;
    }

    public endIgnore() {
        this.inIgnoreState = false;
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
        // console.log("in transaction: " + this.inTransaction);

        if (!this.inIgnoreState) {
            if (this.inUndo) {
                this.addRedo(delta);
            } else {
                this.addUndo(delta);
            }
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
        // console.log("executing undo for unit: "+ unit.name)
        const delta = this.undoStackPerUnit.get(unit.name).pop();
        this.reverseDelta(delta, unit);
        this.inUndo = false;
    }

    executeRedo(unit: PiModelUnit) {
        const delta = this.redoStackPerUnit.get(unit.name).pop();
        this.reverseDelta(delta, unit);
    }

    private reverseDelta(delta: PiDelta, unit: PiModelUnit) {
        console.log(`reverseDelta<${delta.constructor.name}>:  ${delta.toString()} `);
        if (delta instanceof PiPartDelta || delta instanceof PiPrimDelta) {
            if (this.hasIndex(delta)) {
                if (this.checkIndex(delta)) {
                    delta.owner[delta.propertyName][delta.index] = delta.oldValue;
                } else {
                    LOGGER.error(`cannot reverse ${delta.toString()} because the index is incorrect`);
                }
            } else {
                delta.owner[delta.propertyName] = delta.oldValue;
            }
        } else if (delta instanceof PiPartListDelta || delta instanceof PiPrimListDelta) {
            if (delta.removed.length > 0) {
                delta.owner[delta.propertyName].splice(delta.index, 0, ...delta.removed );
            }
            if (delta.added.length > 0) {
                delta.owner[delta.propertyName].splice(delta.index, delta.added.length );
            }
        } else if (delta instanceof PiTransactionDelta) {
            // TODO
        }
    }

    private hasIndex(delta: PiDelta): boolean {
        return delta.index !== null && delta.index !== undefined;
    }

    private checkIndex(delta: PiDelta): boolean {
        return delta.index >= 0 && delta.index < delta.owner[delta.propertyName].length;
    }
}
