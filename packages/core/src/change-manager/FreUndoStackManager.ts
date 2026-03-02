import type { DeltaCommand } from "@lionweb/server-delta-shared"
import { runInAction } from "mobx"
import { FREON } from "../environment/index.js"
import { LIONWEB_DELTA } from "../storage/lionweb-delta/FreToLionWebDeltaConverter.js"
import { notNullOrUndefined } from "../util/index.js"
import type { FreDelta } from "./FreDelta.js"
import { FrePartDelta, FrePartListDelta, FrePrimDelta, FrePrimListDelta, FreTransactionDelta } from "./FreDelta.js"
import type { FreModelUnit } from "../ast/index.js"
import { modelUnit } from "../ast-utils/index.js"
import { FreLogger } from "../logging/index.js"
import { type FreUndoManager } from "./FreUndoManager.js"

const LOGGER: FreLogger = new FreLogger("FreUndoStackManager")

/**
 * Class FreUndoStackManager holds two sets of stacks of change information on a model unit.
 * The information is stored per model unit; one stack for undo info, one for redo info.
 */
export class FreUndoStackManager {
    private static hasIndex(delta: FreDelta): boolean {
        return delta.index !== null && delta.index !== undefined
    }

    private static checkIndex(delta: FreDelta): boolean {
        return delta.index >= 0 && delta.index < delta.owner[delta.propertyName].length
    }
    changeSource: FreModelUnit

    private undoStack: FreDelta[] = []
    private redoStack: FreDelta[] = []
    private inTransaction: boolean = false
    private ignoreTransaction = false;
    private currentTransaction: FreTransactionDelta
    private inUndo: boolean = false
    private undoManager: FreUndoManager

    constructor(undoManager: FreUndoManager, unit: FreModelUnit) {
        this.changeSource = unit
        this.undoManager = undoManager
    }

    public startTransaction(ignore: boolean) {
        LOGGER.log(`startTransaction ignore: ${ignore}`)
        this.ignoreTransaction = ignore
        this.inTransaction = true;
    }

    public endTransaction() {
        LOGGER.log(`endTransaction: ${this.currentTransaction}`)
        if (!this.inTransaction) {
            LOGGER.error(`endTransaction while not in a transaction`)
        }
        this.inTransaction = false;
        if (notNullOrUndefined(this.currentTransaction) && !this.ignoreTransaction) {
            LOGGER.log(`SEND DELTA and PUSH UNDO`)
            if (!this.inUndo) {
                this.undoStack.push(this.currentTransaction)
            }
            if (notNullOrUndefined(FREON.deltaClient)) {
                if (this.currentTransaction instanceof FreTransactionDelta) {
                    // Send all parts of the transactional delta as individual deltas
                    for(const internal of this.currentTransaction.internalDeltas ) {
                        const delta: DeltaCommand = LIONWEB_DELTA.convertDeltaToLionWeb(internal)
                        FREON.deltaClient.deltaApiClient.sendCommand(delta)
                    }
                } else {
                    // We have a single delta
                    const delta: DeltaCommand = LIONWEB_DELTA.convertDeltaToLionWeb(this.currentTransaction)
                    FREON.deltaClient.deltaApiClient.sendCommand(delta)
                }
            }
        } else {
            LOGGER.log(`NO DELTA SEND OR STACKED ignore: ${this.ignoreTransaction} tx: ${this.currentTransaction}`)
        }
        this.currentTransaction = null;
        this.ignoreTransaction = false
    }

    /**
     * A temporary method, because during testing we use the same manager
     */
    public cleanStacks() {
        LOGGER.log("cleanStacks")
        this.undoStack = []
        this.redoStack = []
    }

    public executeUndo(): FreDelta | undefined {
        this.inUndo = true // make sure incoming changes are stored on redo stack
        const delta = this.undoStack.pop()
        LOGGER.log(`executeUndo for unit: '${this.changeSource.name}', delta '${delta?.toString()} stack length now is ${this.undoStack.length}`)
        if (!!delta) {
            this.reverseDelta(delta)
        }
        this.inUndo = false
        return delta
    }

    public executeRedo(): FreDelta | undefined {
        const delta = this.redoStack.pop()
        LOGGER.log(`executeRedo for unit: '${this.changeSource.name}', delta '${delta?.toString()}`)
        if (!!delta) {
            this.reverseDelta(delta)
        }
        return delta
    }

    public addDelta(delta: FreDelta) {
        if (this.ignoreTransaction) {
            return;
        }
        // LOGGER.log(`addDelta inTransaction '${this.inTransaction}' for unit '${this.changeSource?.name}'`);
            if (this.inUndo) {
                LOGGER.log("addDelta: adding redo to " + this.changeSource?.name)
                this.addRedo(delta)
            } else {
                LOGGER.log("addDelta: adding undo to " + this.changeSource?.name)
                this.addUndo(delta)
            }
    }

    private addUndo(delta: FreDelta) {
        LOGGER.log(`addUndo: delta for '${delta.owner.freLanguageConcept()}'.property '${delta.propertyName}' for unit '${this.changeSource?.name}'`)
        if (this.inTransaction) {
            if (this.currentTransaction === null || this.currentTransaction === undefined) {
                this.currentTransaction = new FreTransactionDelta(modelUnit(delta.owner), delta.owner, delta.propertyName, delta.index)
                // this.undoStack.push(this.currentTransaction)
            }
            this.currentTransaction.internalDeltas.push(delta);
            // LOGGER.log("IN TRANSACTION added undo for " + delta.owner.freLanguageConcept() + "[" + delta.propertyName + "]");
        } else {
            this.undoStack.push(delta);
            LOGGER.error("ERROR NO TRANSACTION: added undo for " + delta.owner.freLanguageConcept() + "[" + delta.propertyName + "]");
        }
    }

    private addRedo(delta: FreDelta) {
        if (this.inTransaction) {
            if (this.currentTransaction === null || this.currentTransaction === undefined) {
                this.currentTransaction = new FreTransactionDelta(modelUnit(delta.owner), delta.owner, delta.propertyName, delta.index)
                this.redoStack.push(this.currentTransaction)
            }
            this.currentTransaction.internalDeltas.push(delta)
            // console.log("FreUndoManager: IN TRANSACTION added redo for " + delta.owner.freLanguageConcept() + "[" + delta.propertyName + "]");
        } else {
            this.redoStack.push(delta)
            // console.log("FreUndoManager: added redo for " + delta.owner.freLanguageConcept() + "[" + delta.propertyName + "]");
        }
    }

    private reverseDelta(delta: FreDelta) {
        LOGGER.log(`reverseDelta<${delta.constructor.name}>:  ${delta.toString()}  inTransaction '${this.inTransaction}'`)
        if (delta instanceof FrePartDelta || delta instanceof FrePrimDelta) {
            if (FreUndoStackManager.hasIndex(delta)) {
                if (FreUndoStackManager.checkIndex(delta)) {
                    runInAction(() => {
                        delta.owner[delta.propertyName][delta.index] = delta.oldValue
                    })
                } else {
                    LOGGER.error(`reverseDelta: cannot reverse ${delta.toString()} because the index is incorrect`)
                }
            } else {
                runInAction(() => {
                    delta.owner[delta.propertyName] = delta.oldValue
                })
            }
        } else if (delta instanceof FrePartListDelta || delta instanceof FrePrimListDelta) {
            if (delta.removed.length > 0) {
                runInAction(() => {
                    delta.owner[delta.propertyName].splice(delta.index, 0, ...delta.removed)
                })
            }
            if (delta.added.length > 0) {
                runInAction(() => {
                    delta.owner[delta.propertyName].splice(delta.index, delta.added.length)
                })
            }
        } else if (delta instanceof FreTransactionDelta) {
            // TODO when multiple sources of change are present, then a check is needed whether the state of the unit is such that this delta can be reversed
            this.undoManager.startTransaction(false, this.changeSource)
            for (const sub of delta.internalDeltas.reverse()) {
                this.reverseDelta(sub)
            }
            this.undoManager.endTransaction(this.changeSource)
        }
    }

    nextUndoAsText(): string {
        if (this.undoStack.length > 0) {
            return this.undoStack[this.undoStack.length - 1].toString()
        } else {
            return "nothing left to undo"
        }
    }

    nextRedoAsText(): string {
        if (this.redoStack.length > 0) {
            return this.redoStack[this.redoStack.length - 1].toString()
        } else {
            return "nothing left to redo"
        }
    }
}
