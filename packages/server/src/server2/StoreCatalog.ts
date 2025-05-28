/**
 * Types describing the JSON of the index file: store.json
 */
export type StoreCatalog = {
    models: StoredModel[]
    currentPostfix: number
}

export type StoredModel = {
    name: string,
    folder: string,
    language: string,
    version: string,
    units: StoredUnit[]
}

export type StoredUnit = {
    name: string,
    file: string
}
