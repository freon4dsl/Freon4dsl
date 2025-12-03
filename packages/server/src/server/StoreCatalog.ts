/**
 * Types describing the JSON of the index file: store.json
 */
export type StoreCatalog = {
    models: StoredModel[]
    currentPostfix: number
}

/**
 * Model is stored with meta-data
 */
export type StoredModel = {
    /**
     * The name of the model.
     */
    name: string,
    /**
     * The folder in which the model is stored.
     */
    folder: string,
    /**
     * The Freon language of the model.
     */
    language: string,
    /**
     * The version of the model.
     */
    version: string,
    /**
     * The model-units of the model.
     */
    units: StoredUnit[]
}

export type StoredUnit = {
    /**
     * The name of the model unit
     */
    name: string,
    /**
     * The file in which the model units is stored.
     */
    file: string
}
