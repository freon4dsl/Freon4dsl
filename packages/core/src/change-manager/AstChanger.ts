import { runInAction } from "mobx"
import type { FreModelUnit } from "../ast/index.js"
import { FreLogger } from "../logging/index.js";
import type { FreDelta } from "./FreDelta.js"
import { FreUndoManager } from "./FreUndoManager.js"
import type { IAstChanger } from "./IAstChanger.js"

export type errorFunction = (msg: string) => void

const LOGGER = new FreLogger("AstChanger")
/**
 * This class encapsulates static variables and functions.
 * This to avoid cluttering the global namespace.
 */
export class AstChanger implements IAstChanger {
    private undoManager: FreUndoManager
    constructor() {
        this.undoManager = FreUndoManager.getInstance()
    }

    /**
     * The function that is called when an error is thrown by the _change_ function in _astChange_.
     * @private
     */
    private error: errorFunction = (e: any): void => {
        console.error("FREON.astChanger.change: " + e)
        throw e;
    }

    /**
     * Set the error handling function to _e_
     * @param e
     */
    setErrorFunction(e: errorFunction) {
        this.error = e
    }

    private _isInChange: boolean = false
    get isInChange(): boolean {
        return this._isInChange
    }

    private set isInChange(value: boolean) {
        this._isInChange = value
    }

    /**
     * This function should always be called when a change to the AST is made in the editor.
     * It will ensure that the full change is handled as one action in mobx, avoiding spurious UI updates, and
     * it will ensure that the full change is handled as one transaction by the undo manager so it will be undone
     * in one undo operation.
     * @param changeFunction
     */
    change(changeFunction: () => void): void {
        this.internalChange("noname", changeFunction, false)
    }

    changeNamed(name: string, changeFunction: () => void): void {
        LOGGER.log(`change ${name}`)
        this.internalChange(name, changeFunction, false)
    }

    changeIgnore(name: string, changeFunction: () => void): void {
        LOGGER.log(`changeIgnore: ${name}`)
        this.internalChange(name, changeFunction, true)
    }

    internalChange(_name: string, changeFunction: () => void, ignore: boolean): void {
        // Avoid nested change calls
        if (this.isInChange) {
            changeFunction()
            return
        }
        // Now we have a new change() call
        this.isInChange = true
        this.undoManager.startTransaction(ignore)
        try {
            runInAction(() => {
                changeFunction()
            })
        } catch (e) {
            this.error(e)
        } finally {
            this.undoManager.endTransaction()
            this.isInChange = false
        }
    }

    undo(unit?: FreModelUnit): FreDelta | undefined  {
        return this.undoManager.executeUndo(unit)
    }

    redo(unit?: FreModelUnit): FreDelta | undefined  {
        return this.undoManager.executeRedo(unit)
    }

    public nextUndoAsText(unit?: FreModelUnit): string {
        return this.undoManager.nextUndoAsText(unit)
    }

    public nextRedoAsText(unit?: FreModelUnit): string {
        return this.undoManager.nextRedoAsText(unit)
    }

    /**
     * Reset the AstChanger and Undo/Redo information.
     * After calling this, no undo or redo mis possible.
     */
    public cleanUndoRedo(): void {
        this.undoManager.cleanAllStacks()
    }

    setCurrentUnit(unit: FreModelUnit): void {
        this.undoManager.currentUnit = unit
    }
}
