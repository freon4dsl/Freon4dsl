import {
    FreLanguageClassifier,
    FreLanguage,
    FreLanguageConcept,
    FreLanguageInterface,
    FreLanguageProperty,
    FreLanguageModel,
    FreLanguageModelUnit,
} from "./FreLanguage";

/**
 * Registry for all languages used.
 * Interface is similar to FreLanguage, but it will look into all registered languages.
 */
export class FreLanguageRegistry {
    languages: FreLanguage[] = [];

    /**
     * Find language in which classifier with type `typeName` is defined.
     * @param typeName
     */
    language(typeName: string): FreLanguage {
        for (const lang of this.languages) {
            const result = lang.classifier(typeName);
            if (result !== undefined) {
                return lang;
            }
        }
        return undefined;
    }

    model(): FreLanguageModel {
        for (const lang of this.languages) {
            const result = lang.model();
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }
    concept(typeName: string): FreLanguageConcept {
        for (const lang of this.languages) {
            const result = lang.concept(typeName);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }

    conceptByKey(key: string): FreLanguageConcept {
        for (const lang of this.languages) {
            const result = lang.conceptByKey(key);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }

    unit(typeName: string): FreLanguageModelUnit {
        for (const lang of this.languages) {
            const result = lang.unit(typeName);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }

    unitByKey(key: string): FreLanguageModelUnit {
        for (const lang of this.languages) {
            const result = lang.unitByKey(key);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }

    interface(typeName: string): FreLanguageInterface {
        for (const lang of this.languages) {
            const result = lang.interface(typeName);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }

    interfaceByKey(key: string): FreLanguageInterface {
        for (const lang of this.languages) {
            const result = lang.interfaceByKey(key);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }

    classifier(typeName: string): FreLanguageClassifier {
        for (const lang of this.languages) {
            const result = lang.classifier(typeName);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }

    classifierByKey(key: string): FreLanguageClassifier {
        for (const lang of this.languages) {
            const result = lang.classifierByKey(key);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }

    modelOfType(typeName: string): FreLanguageModel {
        for (const lang of this.languages) {
            const result = lang.modelOfType(typeName);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }

    classifierProperty(typeName: string, propertyName: string): FreLanguageProperty | undefined {
        for (const lang of this.languages) {
            const result = lang.classifierProperty(typeName, propertyName);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }
    getNamedElements() {
        const result: string[] = [];
        for (const lang of this.languages) {
            result.push(...lang.getNamedElements());
        }
        return result;
    }
    getUnitNames() {
        const result: string[] = [];
        for (const lang of this.languages) {
            result.push(...lang.getUnitNames());
        }
        return result;
    }
}
