type PropertyData = {
    id: string;
    key: string;
};

type LanguageData = PropertyData;

type ClassifierData = {
    id: string;
    key: string;
    properties: Map<string, PropertyData>;
};

/**
 * This map holds the mapping from Freon concepts, interfaces, properties etc, to LionWeb ids and keys.
 * The map can be initialized by reading the id.json file,.
 * For non-mapped concepts, etc, ids and keys are automatically created.
 */
export class IdMap {
    idAndKeyStore = new Map<string, ClassifierData>();
    languageStore = new Map<string, LanguageData>();

    setLanguageIdAndKey(language: string, id: string, key: string): void {
        // console.log("IdMap.setLanguageIdAndKey " + language + " id " + id + " key " + key);
        this.languageStore.set(language, { id: id, key: key });
    }

    getLanguageId(language: string): string {
        const data = this.languageStore.get(language);
        if (data === undefined || data.id === undefined) {
            return "-id-" + language;
        } else {
            return data.id;
        }
    }

    getLanguageKey(language: string): string {
        const data = this.languageStore.get(language);
        if (data === undefined || data.id === undefined) {
            return "-key-" + language;
        } else {
            return data.key;
        }
    }

    setClassifierIdAndKey(classifier: string, id: string, key: string): void {
        // console.log("IdMap.setClassifierIdAndKey " + classifier + " id " + id + " key " + key);
        this.idAndKeyStore.set(classifier, { id: id, key: key, properties: new Map<string, PropertyData>() });
    }

    setPropertyIdAndKey(classifier: string, property: string, id: string, key: string): void {
        // console.log("    IdMap.setPropertyIdAndKey " + classifier + "." + property + " id " + id + " key " + key);
        const classifierData = this.idAndKeyStore.get(classifier);
        if (!!classifierData) {
            classifierData.properties.set(property, { id: id, key: key });
        }
    }

    getClassifierId(concept: string) {
        const classifierData = this.idAndKeyStore.get(concept);
        if (classifierData === undefined || classifierData.id === undefined) {
            return "-id-" + concept;
        } else {
            return classifierData.id;
        }
    }

    getClassifierKey(concept: string) {
        const classifierData = this.idAndKeyStore.get(concept);
        if (classifierData === undefined || classifierData.key === undefined) {
            return "-key-" + concept;
        } else {
            return classifierData.key;
        }
    }

    getPropertyId(concept: string, property: string) {
        const classifierData = this.idAndKeyStore.get(concept);
        if (classifierData === undefined || classifierData.id === undefined) {
            return "-id-" + concept + "-" + property;
        } else {
            const prop = classifierData.properties.get(property);
            if (prop === undefined || prop.id === undefined) {
                return "-id-" + concept + "-" + property;
            } else {
                return prop.id;
            }
        }
    }

    getPropertyKey(concept: string, property: string) {
        const classifierData = this.idAndKeyStore.get(concept);
        if (classifierData === undefined || classifierData.key === undefined) {
            return "-key-" + concept + "-" + property;
        } else {
            const prop = classifierData.properties.get(property);
            if (prop === undefined || prop.key === undefined) {
                return "-key-" + concept + "-" + property;
            } else {
                return prop.key;
            }
        }
    }
}
