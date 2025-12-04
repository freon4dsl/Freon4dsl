import { FreLogger } from "../logging/index.js";
import { FreChangeManager } from "./FreChangeManager.js";
import { type FreDelta, type FrePrimDelta } from "./FreDelta.js"
import { AstWalker, model } from "../ast-utils/index.js"
import { ReferenceUpdateWorker } from "./ReferenceUpdateWorker.js"

const LOGGER = new FreLogger("ReferenceUpdateManager").mute()

/**
 * Class ReferenceUpdateManager ensures that when a user changes the name of
 * a node, we update all references that refer to it
 */
export class ReferenceUpdateManager {
    private static theInstance; // the only instance of this class

    /**
     * This method implements the singleton pattern
     */
    public static getInstance(): ReferenceUpdateManager {
        if (this.theInstance === undefined || this.theInstance === null) {
            this.theInstance = new ReferenceUpdateManager();
        }
        return this.theInstance;
    }

    private constructor() {
        FreChangeManager.getInstance().subscribeToPrimitive((delta: FreDelta) => this.updateReferences(delta));
    }

    /**
     * (From the Freon documentation) References are always by name, therefore
     * the referred concept must have a _name_ property of type identifier.
     * @param delta
     * @private
     */
    private updateReferences(delta: FreDelta) {
        if (!!delta.propertyName && delta.propertyName === "name") {
            const nameDelta: FrePrimDelta = delta as FrePrimDelta;
            LOGGER.log(` update references for the node ${nameDelta.oldValue} renamed to ${nameDelta.newValue}`)

            // set up the walker of the visitor pattern
            const refWorker = new ReferenceUpdateWorker(nameDelta);
            const astWalker = new AstWalker();
            astWalker.myWorkers.push(refWorker);
            // TODO wrap in AST.change() when references are added to undo
            astWalker.walk(model(delta.unit))
        }
    }
}
