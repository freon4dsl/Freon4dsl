import { PiChangeManager } from "../change-manager/PiChangeManager";
import { PiModelUnit } from "../ast";
import { PiDelta, TransactionDelta } from "./PiDelta";
import { PiLogger } from "../util";

const LOGGER: PiLogger = new PiLogger("PiUndoManager");
/**
 * Class PiUndoManager holds two sets of stacks of change information on the model.
 * The information is stored per model unit; one stack for undo info, one for redo info.
 */
export class PiUndoManager {
    private static theInstance; // the only instance of this class
    private inTransaction: boolean = false;
    private currentTransaction: TransactionDelta;

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
        PiChangeManager.getInstance().changeRefCallbacks.push(
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
        let myStack = this.undoStackPerUnit.get("UndoUnit");
        if (myStack === null || myStack === undefined) {
            this.undoStackPerUnit.set("UndoUnit", []);
            myStack = this.undoStackPerUnit.get("UndoUnit");
            // LOGGER.log("added stack for unit UndoUnit")
        }
        if (this.inTransaction) {
            if (this.currentTransaction === null || this.currentTransaction === undefined) {
                this.currentTransaction = new TransactionDelta(delta.owner, delta.propertyName, delta.index);
                myStack.push(this.currentTransaction);
            }
            this.currentTransaction.internalDeltas.push(delta);
            LOGGER.log("PiUndoManager: IN TRANSACTION added undo for " + delta.owner.piLanguageConcept() + "[" + delta.propertyName + "]");
        } else {
            myStack.push(delta);
            LOGGER.log("PiUndoManager: added undo for " + delta.owner.piLanguageConcept() + "[" + delta.propertyName + "]");
        }
    }

    executeUndo(unit: PiModelUnit) {
        const delta = this.undoStackPerUnit.get(unit.name).pop();
        this.executeDelta(delta);
    }

    executeRedo(unit: PiModelUnit) {
        const delta = this.redoStackPerUnit.get(unit.name).pop();
        this.executeDelta(delta);
    }

    private executeDelta(delta: PiDelta) {
        // TODO make sure incoming change is stored on redo stack
    }
}
