import { PiDelta, PiPartDelta, PiPartListDelta, PiPrimDelta, PiPrimListDelta, PiTransactionDelta } from "./PiDelta";
import { PiModelUnit } from "../ast";
import { modelUnit } from "../ast-utils";
import { PiLogger } from "../logging";
import { PiUndoManager } from "./PiUndoManager";

const LOGGER: PiLogger = new PiLogger("PiUndoStackManager");

/**
 * Class PiUndoStackManager holds two sets of stacks of change information on a model unit.
 * The information is stored per model unit; one stack for undo info, one for redo info.
 */
export class PiUndoStackManager {
    changeSource: PiModelUnit;

    private undoStack: PiDelta[] = [];
    private redoStack: PiDelta[] = [];
    private inIgnoreState: boolean = false;
    private inTransaction: boolean = false;
    private currentTransaction: PiTransactionDelta;
    private inUndo: boolean = false;

    constructor(unit: PiModelUnit) {
       this.changeSource = unit;
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

    /**
     * A temporary method, because during testing we use the same manager
     */
    public cleanStacks() {
        this.undoStack = [];
        this.redoStack = [];
    }

    public executeUndo() {
        this.inUndo = true; // make sure incoming changes are stored on redo stack
        const delta = this.undoStack.pop();
        // console.log("executing undo for unit: "+ this.changeSource.name + ", " + delta.toString())
        if (!!delta) {
            this.reverseDelta(delta);
        }
        this.inUndo = false;
    }

    public executeRedo() {
        const delta = this.redoStack.pop();
        if (!!delta) {
            this.reverseDelta(delta);
        }
    }

    public addDelta(delta: PiDelta) {
        // console.log("in transaction: " + this.inTransaction);
        if (!this.inIgnoreState) {
            if (this.inUndo) {
                // console.log('adding redo to ' + this.changeSource?.name)
                this.addRedo(delta);
            } else {
                // console.log('adding undo to ' + this.changeSource?.name)
                this.addUndo(delta);
            }
        }
    }

    private addUndo(delta: PiDelta) {
        if (this.inTransaction) {
            if (this.currentTransaction === null || this.currentTransaction === undefined) {
                this.currentTransaction = new PiTransactionDelta(modelUnit(delta.owner), delta.owner, delta.propertyName, delta.index);
                this.undoStack.push(this.currentTransaction);
            }
            this.currentTransaction.internalDeltas.push(delta);
            // console.log("PiUndoManager: IN TRANSACTION added undo for " + delta.owner.piLanguageConcept() + "[" + delta.propertyName + "]");
        } else {
            this.undoStack.push(delta);
            // console.log("PiUndoManager: added undo for " + delta.owner.piLanguageConcept() + "[" + delta.propertyName + "]");
        }
    }

    private addRedo(delta: PiDelta) {
        if (this.inTransaction) {
            if (this.currentTransaction === null || this.currentTransaction === undefined) {
                this.currentTransaction = new PiTransactionDelta(modelUnit(delta.owner), delta.owner, delta.propertyName, delta.index);
                this.redoStack.push(this.currentTransaction);
            }
            this.currentTransaction.internalDeltas.push(delta);
            // console.log("PiUndoManager: IN TRANSACTION added redo for " + delta.owner.piLanguageConcept() + "[" + delta.propertyName + "]");
        } else {
            this.redoStack.push(delta);
            // console.log("PiUndoManager: added redo for " + delta.owner.piLanguageConcept() + "[" + delta.propertyName + "]");
        }
    }

    private reverseDelta(delta: PiDelta) {
        // console.log(`reverseDelta<${delta.constructor.name}>:  ${delta.toString()} `);
        if (delta instanceof PiPartDelta || delta instanceof PiPrimDelta) {
            if (PiUndoStackManager.hasIndex(delta)) {
                if (PiUndoStackManager.checkIndex(delta)) {
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
            // TODO when multiple sources of change are present, then a check is needed whether the state of the unit is such that this delta can be reversed
            PiUndoManager.getInstance().startTransaction(this.changeSource);
            for (const sub of delta.internalDeltas) {
                this.reverseDelta(sub);
            }
            PiUndoManager.getInstance().endTransaction(this.changeSource);
        }
    }

    private static hasIndex(delta: PiDelta): boolean {
        return delta.index !== null && delta.index !== undefined;
    }

    private static checkIndex(delta: PiDelta): boolean {
        return delta.index >= 0 && delta.index < delta.owner[delta.propertyName].length;
    }

    nextUndoAsText(): string {
        if (this.undoStack.length > 0) {
            return this.undoStack[this.undoStack.length - 1].toString();
        } else {
            return 'nothing left to undo'
        }
    }

    nextRedoAsText(): string {
        if (this.redoStack.length > 0) {
            return this.redoStack[this.redoStack.length - 1].toString();
        } else {
            return 'nothing left to redo'
        }
    }
}
