import { PiClassifier, PiConcept, PiInterface } from "./index";

// TODO add all find methods from PiLanguage.ts to this util module

export class PiLangUtil {
    public static superConcepts(self: PiClassifier): PiConcept[] {
        const result: PiConcept[] = [];
        PiLangUtil.superConceptsRecursive(self, result);
        return result;
    }

    public static superConceptsRecursive(self: PiClassifier, result: PiConcept[]): void {
        if (self instanceof PiConcept) {
            if(!!self.base) {
                result.push(self.base.referred);
                PiLangUtil.superConceptsRecursive(self.base.referred, result);
            }
            for (let i of self.interfaces) {
                PiLangUtil.superConceptsRecursive(i.referred, result);
            }
        }
        if (self instanceof PiInterface) {
            for (let i of self.base) {
                PiLangUtil.superConceptsRecursive(i.referred, result);
            }
        }
    }

    public static superClassifiers(self: PiClassifier): PiClassifier[] {
        const result: PiClassifier[] = [];
        PiLangUtil.superClassifiersRecursive(self, result);
        return result;
    }

    private static superClassifiersRecursive(self: PiClassifier, result: PiClassifier[]) {
        if (self instanceof PiConcept) {
            if(!!self.base) {
                result.push(self.base.referred);
                PiLangUtil.superClassifiersRecursive(self.base.referred, result);
            }
            for (let i of self.interfaces) {
                result.push(i.referred);
                PiLangUtil.superClassifiersRecursive(i.referred, result);
            }
        }
        if (self instanceof PiInterface) {
            for (let i of self.base) {
                result.push(i.referred);
                PiLangUtil.superClassifiersRecursive(i.referred, result);
            }
        }
    }

    public static subConcepts(self: PiClassifier): PiConcept[] {
        const result: PiConcept[] = [];
        for (let cls of self.language.concepts) {
            if (PiLangUtil.superClassifiers(cls).includes(self)) {
                result.push(cls);
            }
        }
        return result;
    }

    public static subConceptsIncludingSelf(self: PiClassifier): PiConcept[] {
        const result= PiLangUtil.subConcepts(self);
        if(self instanceof PiConcept) {
            result.push(self);
        }
        return result;
    }
}
