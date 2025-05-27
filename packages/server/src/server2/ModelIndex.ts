export type StoredIndex = {
    models: StoredModel[]
    currentIndex: number
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
