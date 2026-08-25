// root of the inheritance structure of all elements in a language definition
import { FreMetaDefinitionElement } from "../../utils/no-dependencies/index.js"

export abstract class FreMetaLangElement extends FreMetaDefinitionElement {
    protected _name: string = ""
    get name(): string {
        return this._name
    }
    set name(v: string) {
        this._name = v
    }
}
