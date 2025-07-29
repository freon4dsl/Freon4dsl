import { runInAction } from "mobx";
import {
    FreDelta,
    FrePartDelta,
    FrePartListDelta,
    FrePrimDelta,
    FrePrimListDelta,
    FreTransactionDelta,
} from "./FreDelta.js";
import { FreModelUnit } from "../ast/index.js";
import { modelUnit } from "../ast-utils/index.js";
import { FreLogger } from "../logging/index.js";
import { FreUndoManager } from "./FreUndoManager.js";

const LOGGER: FreLogger = new FreLogger("FreUndoStackManager").mute();

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
        LOGGER.log("cleanStacks")
        this.undoStack = [];
        this.redoStack = [];
    }

    public executeUndo(): FreDelta | undefined {
        this.inUndo = true; // make sure incoming changes are stored on redo stack
        const delta = this.undoStack.pop();
        LOGGER.log(`executeUndo for unit: '${this.changeSource.name}', delta '${delta?.toString()}`)
        if (!!delta) {
            this.reverseDelta(delta);
        }
        this.inUndo = false;
        return delta
    }

    public executeRedo(): FreDelta | undefined {
        const delta = this.redoStack.pop();
        LOGGER.log(`executeRedo for unit: '${this.changeSource.name}', delta '${delta?.toString()}`)
        if (!!delta) {
            this.reverseDelta(delta);
        }
        return delta
    }

    public addDelta(delta: FreDelta) {
        // LOGGER.log(`addDelta inTransaction '${this.inTransaction}' for unit '${this.changeSource?.name}'`);
        if (!this.inIgnoreState) {
            if (this.inUndo) {
                LOGGER.log('addDelta: adding redo to ' + this.changeSource?.name)
                this.addRedo(delta);
            } else {
                LOGGER.log('addDelta: adding undo to ' + this.changeSource?.name)
                this.addUndo(delta);
            }
        } else {
            LOGGER.log("addDelta ignored")
        }
    }

    private addUndo(delta: FreDelta) {
        LOGGER.log(`addUndo: delta for '${delta.owner.freLanguageConcept()}'.property '${delta.propertyName}' for unit '${this.changeSource?.name}'`)
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
            // LOGGER.log("IN TRANSACTION added undo for " + delta.owner.freLanguageConcept() + "[" + delta.propertyName + "]");
        } else {
            this.undoStack.push(delta);
            // LOGGER.log("FreUndoManager: added undo for " + delta.owner.freLanguageConcept() + "[" + delta.propertyName + "]");
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
        LOGGER.log(`reverseDelta<${delta.constructor.name}>:  ${delta.toString()}  inTransaction '${this.inTransaction}'`);
        if (delta instanceof FrePartDelta || delta instanceof FrePrimDelta) {
            if (FreUndoStackManager.hasIndex(delta)) {
                if (FreUndoStackManager.checkIndex(delta)) {
                    runInAction( () => {
                        delta.owner[delta.propertyName][delta.index] = delta.oldValue;
                    })
                } else {
                    LOGGER.error(`reverseDelta: cannot reverse ${delta.toString()} because the index is incorrect`);
                }
            } else {
                runInAction( () => {
                    delta.owner[delta.propertyName] = delta.oldValue;
                })
            }
        } else if (delta instanceof FrePartListDelta || delta instanceof FrePrimListDelta) {
            if (delta.removed.length > 0) {
                runInAction( () => {
                    delta.owner[delta.propertyName].splice(delta.index, 0, ...delta.removed);
                })
            }
            if (delta.added.length > 0) {
                runInAction( () => {
                    delta.owner[delta.propertyName].splice(delta.index, delta.added.length);
                })
            }
        } else if (delta instanceof FreTransactionDelta) {
            // TODO when multiple sources of change are present, then a check is needed whether the state of the unit is such that this delta can be reversed
            FreUndoManager.getInstance().startTransaction(this.changeSource);
            for (const sub of delta.internalDeltas.reverse()) {
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
