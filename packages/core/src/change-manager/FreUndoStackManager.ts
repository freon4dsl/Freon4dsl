import {
    FreDelta,
    FrePartDelta,
    FrePartListDelta,
    FrePrimDelta,
    FrePrimListDelta,
    FreTransactionDelta,
} from "./FreDelta";
import { FreModelUnit } from "../ast";
import { modelUnit } from "../ast-utils";
import { FreLogger } from "../logging";
import { FreUndoManager } from "./FreUndoManager";

const LOGGER: FreLogger = new FreLogger("FreUndoStackManager");

/**
 * Class FreUndoStackManager holds two sets of stacks of change information on a model unit.
 * The information is stored per model unit; one stack for undo info, one for redo info.
 */
export class FreUndoStackManager {
    private static hasIndex(delta: FreDelta): boolean {
        return delta.index !== null && delta.index !== undefined;
    }

    private static checkIndex(delta: FreDelta): boolean {
        return delta.index >= 0 && delta.index < delta.owner[delta.propertyName].length;
    }
    changeSource: FreModelUnit;

    private undoStack: FreDelta[] = [];
    private redoStack: FreDelta[] = [];
    private inIgnoreState: boolean = false;
    private inTransaction: boolean = false;
    private currentTransaction: FreTransactionDelta;
    private inUndo: boolean = false;

    constructor(unit: FreModelUnit) {
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

    public addDelta(delta: FreDelta) {
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

    private addUndo(delta: FreDelta) {
        if (this.inTransaction) {
            if (this.currentTransaction === null || this.currentTransaction === undefined) {
                this.currentTransaction = new FreTransactionDelta(
                    modelUnit(delta.owner),
                    delta.owner,
                    delta.propertyName,
                    delta.index,
                );
                this.undoStack.push(this.currentTransaction);
            }
            this.currentTransaction.internalDeltas.push(delta);
            // console.log("FreUndoManager: IN TRANSACTION added undo for " + delta.owner.freLanguageConcept() + "[" + delta.propertyName + "]");
        } else {
            this.undoStack.push(delta);
            // console.log("FreUndoManager: added undo for " + delta.owner.freLanguageConcept() + "[" + delta.propertyName + "]");
        }
    }

    private addRedo(delta: FreDelta) {
        if (this.inTransaction) {
            if (this.currentTransaction === null || this.currentTransaction === undefined) {
                this.currentTransaction = new FreTransactionDelta(
                    modelUnit(delta.owner),
                    delta.owner,
                    delta.propertyName,
                    delta.index,
                );
                this.redoStack.push(this.currentTransaction);
            }
            this.currentTransaction.internalDeltas.push(delta);
            // console.log("FreUndoManager: IN TRANSACTION added redo for " + delta.owner.freLanguageConcept() + "[" + delta.propertyName + "]");
        } else {
            this.redoStack.push(delta);
            // console.log("FreUndoManager: added redo for " + delta.owner.freLanguageConcept() + "[" + delta.propertyName + "]");
        }
    }

    private reverseDelta(delta: FreDelta) {
        // console.log(`reverseDelta<${delta.constructor.name}>:  ${delta.toString()} `);
        if (delta instanceof FrePartDelta || delta instanceof FrePrimDelta) {
            if (FreUndoStackManager.hasIndex(delta)) {
                if (FreUndoStackManager.checkIndex(delta)) {
                    delta.owner[delta.propertyName][delta.index] = delta.oldValue;
                } else {
                    LOGGER.error(`cannot reverse ${delta.toString()} because the index is incorrect`);
                }
            } else {
                delta.owner[delta.propertyName] = delta.oldValue;
            }
        } else if (delta instanceof FrePartListDelta || delta instanceof FrePrimListDelta) {
            if (delta.removed.length > 0) {
                delta.owner[delta.propertyName].splice(delta.index, 0, ...delta.removed);
            }
            if (delta.added.length > 0) {
                delta.owner[delta.propertyName].splice(delta.index, delta.added.length);
            }
        } else if (delta instanceof FreTransactionDelta) {
            // TODO when multiple sources of change are present, then a check is needed whether the state of the unit is such that this delta can be reversed
            FreUndoManager.getInstance().startTransaction(this.changeSource);
            for (const sub of delta.internalDeltas) {
                this.reverseDelta(sub);
            }
            FreUndoManager.getInstance().endTransaction(this.changeSource);
        }
    }

    nextUndoAsText(): string {
        if (this.undoStack.length > 0) {
            return this.undoStack[this.undoStack.length - 1].toString();
        } else {
            return "nothing left to undo";
        }
    }

    nextRedoAsText(): string {
        if (this.redoStack.length > 0) {
            return this.redoStack[this.redoStack.length - 1].toString();
        } else {
            return "nothing left to redo";
        }
    }
}
