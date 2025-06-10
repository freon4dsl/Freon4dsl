import { StoreCatalog, StoredModel, StoredUnit } from "@freon4dsl/server/dist/index";
import { DirectoryWorker } from "./DirectoryWalker";

export class ModelStoreWorker implements DirectoryWorker {
    storeIndex: StoreCatalog = {
        currentPostfix: 1,
        models: []
    }
    dirs: string[]= []
    
    currentModel: StoredModel;
    
    visitDir(dir: string): void {
        console.log(`Visit dir ${dir}` )
        this.currentModel = {
            folder: this.shortName(dir),
            language: "unknow",
            name: this.shortName(dir),
            units: [],
            version: "1"
        }
        this.dirs.push(dir)
        this.storeIndex.models.push(this.currentModel)
    }

    visitFile(file: string): void {
        const shortFile = this.shortName(file)
        console.log(`Visit file ${this.dirs.join("/")} => ${shortFile}` )
        if (file.endsWith("store.json")) {
            return;
        }
        const unit: StoredUnit = {
            file: shortFile,
            name: shortFile
        }
        this.currentModel.units.push(unit)
    }

    visitDirAfter(dir: string): void {
        console.log(`Visit dir after ${dir}` )
        this.currentModel = undefined
        this.dirs.pop()
    }   
    
    shortName(longName: string): string {
        const splits = longName.split("/")
        const shortFile = splits[splits.length-1]
        return shortFile

    }
}
