import { FreLogger } from "../logging/index.js";
import { FreChangeManager } from "./FreChangeManager.js";
import type { FreModelUnit } from "../ast/index.js";
import { FreDelta, FrePrimDelta, FrePartDelta, FrePartListDelta, FrePrimListDelta } from "./FreDelta.js";
import { FreUndoStackManager } from "./FreUndoStackManager.js";

const LOGGER = new FreLogger("FreUndoManager").mute()
/**
 * Class FreUndoManager holds the change information on the model.
 * The information is stored per model unit; one stack for undo info, one for redo info.
 * Any changes that cannot be attributed to a single unit are stored separately.
 */
export class FreUndoManager {
    private static theInstance; // the only instance of this class

    /**
     * This method implements the singleton pattern
     */
    public static getInstance(): FreUndoManager {
        if (this.theInstance === undefined || this.theInstance === null) {
            this.theInstance = new FreUndoManager();
        }
        return this.theInstance;
    }

    // Note: the implementation depends on the freId() of the units, which is different each time a unit is read from storage
    // We assume the Map is only used during a single run of the tool.
    private undoManagerPerUnit: Map<string, FreUndoStackManager> = new Map<string, FreUndoStackManager>();
    private modelUndoManager: FreUndoStackManager = new FreUndoStackManager(null);
    private inTransaction: boolean = false;
    // private unitForTransaction: FreModelUnit = null;
    /**
     * The current unit for which undo/redo should be done
     */
    public currentUnit: FreModelUnit = null;

    public startTransaction(unit?: FreModelUnit) {
        LOGGER.log(`>> startTransaction for unit ${unit?.name} currentUnit is ${this.currentUnit?.name}`)
        if (unit === undefined) {
            unit = this.currentUnit
        }
        if (!!unit) {
            this.getUndoStackManager(unit).startTransaction();
            // this.unitForTransaction = unit;
        } else {
            this.modelUndoManager.startTransaction();
        }
        this.inTransaction = true;
    }

    public endTransaction(unit?: FreModelUnit) {
        LOGGER.log(`<< endTransaction for unit ${unit?.name} currentUnit is ${this.currentUnit?.name}`)
        if (unit === undefined) {
            unit = this.currentUnit
        }
        if (!!unit) {
            this.getUndoStackManager(unit).endTransaction();
            // this.unitForTransaction = null;
        } else {
            this.modelUndoManager.endTransaction();
        }
        this.inTransaction = false;
    }

    public startIgnore(unit?: FreModelUnit) {
        LOGGER.log(`startIgnore for unit ${unit?.name} currentUnit is ${this.currentUnit?.name}`)
        if (unit === undefined) {
            unit = this.currentUnit
        }
        if (!!unit) {
            this.getUndoStackManager(unit).startIgnore();
        } else {
            this.modelUndoManager.startIgnore();
        }
    }

    public endIgnore(unit?: FreModelUnit) {
        LOGGER.log(`endIgnore for unit ${unit?.name} currentUnit is ${this.currentUnit?.name}`)
        if (unit === undefined) {
            unit = this.currentUnit
        }
        if (!!unit) {
            this.getUndoStackManager(unit).endIgnore();
        } else {
            this.modelUndoManager.endIgnore();
        }
    }

    public cleanStacks(unit?: FreModelUnit) {
        LOGGER.log(`cleanStacks for unit ${unit?.name} currentUnit is ${this.currentUnit?.name}`)
        if (unit === undefined) {
            unit = this.currentUnit
        }
        if (!!unit) {
            this.getUndoStackManager(unit).cleanStacks();
        } else {
            this.modelUndoManager.cleanStacks();
        }
    }

    public cleanAllStacks() {
        this.undoManagerPerUnit.forEach((val) => val.cleanStacks());
        this.modelUndoManager.cleanStacks();
    }

    public nextUndoAsText(unit?: FreModelUnit): string {
        if (unit === undefined) {
            unit = this.currentUnit
        }
        if (!!unit) {
            // console.log("execute undo for unit" )
            return this.getUndoStackManager(unit).nextUndoAsText();
        } else {
            // console.log("execute undo for model" )
            return this.modelUndoManager.nextUndoAsText();
        }
    }

    public nextRedoAsText(unit?: FreModelUnit): string {
        if (unit === undefined) {
            unit = this.currentUnit
        }
        if (!!unit) {
            // console.log("execute undo for unit" )
            return this.getUndoStackManager(unit).nextRedoAsText();
        } else {
            // console.log("execute undo for model" )
            return this.modelUndoManager.nextRedoAsText();
        }
    }

    public executeUndo(unit?: FreModelUnit) {
        if (unit === undefined) {
            unit = this.currentUnit
        }
        if (!!unit) {
            LOGGER.log(`executeUndo for unit ${unit?.name} currentUnit is ${this.currentUnit?.name}`)
            this.getUndoStackManager(unit).executeUndo();
        } else {
            LOGGER.log("executeUndo for model" )
            this.modelUndoManager.executeUndo();
        }
    }

    public executeRedo(unit?: FreModelUnit) {
        LOGGER.log(`executeRedo for unit ${unit?.name} currentUnit is ${this.currentUnit?.name}`)
        if (unit === undefined) {
            unit = this.currentUnit
        }
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
        FreChangeManager.getInstance().subscribeToPrimitive((delta: FrePrimDelta) => this.addDelta(delta));
        FreChangeManager.getInstance().subscribeToPart((delta: FrePartDelta) => this.addDelta(delta));
        FreChangeManager.getInstance().subscribeToListElement((delta: FrePartDelta | FrePrimDelta) => this.addDelta(delta));
        FreChangeManager.getInstance().subscribeToList((delta: FrePartListDelta | FrePrimListDelta) => this.addDelta(delta));
    }

    private addDelta(delta: FreDelta) {
        LOGGER.log(` addDelta for unit ${this.currentUnit?.name}`)
        if (this.inTransaction) {
            // we are in a transaction => store all changes in the unit that originated the transaction
            if (!!this.currentUnit) {
                this.getUndoStackManager(this.currentUnit).addDelta(delta);
            } else {
                // the model has changed => store in model manager
                // console.log("adding transaction to model")
                this.modelUndoManager.addDelta(delta);
            }
        } else {
            // not in a transaction => store the changes in the unit that is changed.
            if (!!delta.unit) {
                // console.log("adding delta to " + delta.unit.name)
                this.getUndoStackManager(delta.unit).addDelta(delta);
            } else {
                // the model has changed => store in model manager
                // console.log("adding delta to model")
                this.modelUndoManager.addDelta(delta);
            }
        }
    }

    private getUndoStackManager(unit?: FreModelUnit): FreUndoStackManager {
        if (!!unit) {
            let unitManager = this.undoManagerPerUnit.get(unit.freId());
            if (!unitManager) {
                unitManager = new FreUndoStackManager(unit);
                this.undoManagerPerUnit.set(unit.freId(), unitManager);
            }
            return unitManager;
        } else {
            return this.modelUndoManager;
        }
    }
}
