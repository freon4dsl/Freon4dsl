import type { FreModelUnit } from "../ast/index.js"
import type { FreDelta } from "./FreDelta.js"

export type errorFunction = (msg: string) => void

/**
 * This class encapsulates static variables and functions.
 * This to avoid cluttering the global namespace.
 */
export interface IAstChanger {
    /**
     * Set the error handling function to _e_
     * @param e
     */
    setErrorFunction(e: errorFunction)
    
    isInChange: boolean
    /**
     * This function should always be called when a change to the AST is made in the editor.
     * It will ensure that the full change is handled as one action in mobx, avoiding spurious UI updates, and
     * it will ensure that the full change is handled as one transaction by the undo manager so it will be undone
     * in one undo operation.
     * @param changeFunction
     */
    change(changeFunction: () => void): void
    
    changeNamed(name: string, changeFunction: () => void): void 

    changeIgnore(name: string, changeFunction: () => void): void 
    
    undo(unit?: FreModelUnit): FreDelta | undefined

    redo(unit?: FreModelUnit): FreDelta | undefined

    nextUndoAsText(unit?: FreModelUnit): string

    nextRedoAsText(unit?: FreModelUnit): string

    cleanUndoRedo(): void
    
    setCurrentUnit(unit: FreModelUnit): void
}
