import { StoreCatalog, StoredModel, StoredUnit } from "@freon4dsl/server/dist/index.js";
import { DirectoryWorker } from "./DirectoryWalker.js";

/**
 * Worker that creates the modelstore index JSON file using the DirectoryWalker.
 */
export class ModelStoreWorker implements DirectoryWorker {
    storeIndex: StoreCatalog = {
        currentPostfix: 1,
        models: []
    }
    dirs: string[]= []
    
    currentModel: StoredModel;

    /**
     * Create a new model representing the directory `dir`.
     * Set the current model to this new model, so files can be added in `visitFile`
     * @param dir
     */
    visitDir(dir: string): void {
        console.log(`Visit dir ${dir}` )
        this.currentModel = {
            folder: this.shortName(dir),
            language: "",
            name: this.shortName(dir),
            units: [],
            version: "1"
        }
        this.dirs.push(dir)
        this.storeIndex.models.push(this.currentModel)
    }

    /**
     * Add the `file` representing a modelunit to the current model.
     * @param file
     */
    visitFile(file: string): void {
        const shortFile = this.shortName(file)
        console.log(`Visit file ${this.dirs.join("/")} => ${shortFile}` )
        if (file.endsWith("store.json")) {
            return;
        }
        const unit: StoredUnit = {
            file: shortFile + ".json",
            name: shortFile
        }
        this.currentModel.units.push(unit)
    }

    /**
     * Unset the current model
     * @param dir
     */
    visitDirAfter(dir: string): void {
        console.log(`Visit dir after ${dir}` )
        this.currentModel = undefined
        this.dirs.pop()
    }   
    
    private shortName(longName: string): string {
        const splits = longName.split("/")
        const shortFile = splits[splits.length-1]
        return (shortFile.endsWith(".json") ? shortFile.substring(0, shortFile.length - 5) : shortFile)
    }
}
