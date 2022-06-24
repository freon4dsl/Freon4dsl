import { PiChangeManager } from "./PiChangeManager";
import { PiModelUnit } from "../ast";
import { PiDelta } from "./PiDelta";
import { PiUndoStackManager } from "./PiUndoStackManager";

/**
 * Class PiUndoManager holds two sets of stacks of change information on the model.
 * The information is stored per model unit; one stack for undo info, one for redo info.
 */
export class PiUndoManager {
    private static theInstance; // the only instance of this class

    /**
     * This method implements the singleton pattern
     */
    public static getInstance(): PiUndoManager {
        if (this.theInstance === undefined || this.theInstance === null) {
            this.theInstance = new PiUndoManager();
        }
        return this.theInstance;
    }

    // Note: the implementation depends on the piId() of the units, which is different each time a unit is read from storage
    // We assume the Map is only used during a single run of the tool.
    private undoManagerPerUnit: Map<string, PiUndoStackManager> = new Map<string, PiUndoStackManager>();
    public modelUndoManager: PiUndoStackManager = new PiUndoStackManager(null);
    private inTransaction: boolean = false;
    private unitForTransaction: PiModelUnit = null;

    //// for testing purposes only
    getUndoStackPerUnit(unit: PiModelUnit): PiDelta[] {
        if (!!unit) {
            return this.getUndoStackManager(unit).undoStack;
        } else {
            return this.modelUndoManager.undoStack;
        }
    }

    getRedoStackPerUnit(unit: PiModelUnit): PiDelta[] {
        if (!!unit) {
            return this.getUndoStackManager(unit).redoStack;
        } else {
            return this.modelUndoManager.redoStack;
        }
    }
    ///// end for testing purposes only

    public startTransaction(unit: PiModelUnit) {
        if (!!unit) {
            this.getUndoStackManager(unit).startTransaction();
            this.unitForTransaction = unit;
        } else {
            this.modelUndoManager.startTransaction();
        }
        this.inTransaction = true;
    }


    public endTransaction(unit: PiModelUnit) {
        if (!!unit) {
            this.getUndoStackManager(unit).endTransaction();
            this.unitForTransaction = null;
        } else {
            this.modelUndoManager.endTransaction();
        }
        this.inTransaction = false;
    }

    public startIgnore(unit: PiModelUnit) {
        if (!!unit) {
            this.getUndoStackManager(unit).startIgnore();
        } else {
            this.modelUndoManager.startIgnore();
        }
    }

    public endIgnore(unit: PiModelUnit) {
        if (!!unit) {
            this.getUndoStackManager(unit).endIgnore();
        } else {
            this.modelUndoManager.endIgnore();
        }
    }

    /**
     * A temporary method, because during testing we use the same manager
     */
    public cleanStacks(unit: PiModelUnit) {
        if (!!unit) {
            this.getUndoStackManager(unit).cleanStacks();
        } else {
            this.modelUndoManager.cleanStacks();
        }
    }

    public executeUndo(unit: PiModelUnit) {
        if (!!unit) {
            this.getUndoStackManager(unit).executeUndo();
        } else {
            this.modelUndoManager.executeUndo();
        }
    }

    public executeRedo(unit: PiModelUnit) {
        if (!!unit) {
            this.getUndoStackManager(unit).executeRedo();
        } else {
            this.modelUndoManager.executeRedo();
        }
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
        if (this.inTransaction) {
            // we are in a transaction => store all changes in the unit that originated the transaction
            if (!!this.unitForTransaction) {
                this.getUndoStackManager(this.unitForTransaction).addDelta(delta);
            } else {
                // the model has changed => store in model manager
                this.modelUndoManager.addDelta(delta);
            }
        } else {
            // not in a transaction => store the changes in the unit that is changed.
            if (!!delta.unit) {
                this.getUndoStackManager(delta.unit).addDelta(delta);
            } else {
                // the model has changed => store in model manager
                this.modelUndoManager.addDelta(delta);
            }
        }
    }

    private getUndoStackManager(unit: PiModelUnit): PiUndoStackManager {
        if (!!unit) {
            let unitManager = this.undoManagerPerUnit.get(unit.name);
            if (!unitManager) {
                unitManager = new PiUndoStackManager(unit);
                this.undoManagerPerUnit.set(unit.name, unitManager);
            }
            return unitManager;
        } else {
            return this.modelUndoManager;
        }
    }
}
