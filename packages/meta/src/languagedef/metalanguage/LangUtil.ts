import { PiClassifier, PiConcept, PiInterface } from "./index";

export class LangUtil {
    public static superClasses(self: PiClassifier): PiConcept[] {
        const result: PiConcept[] = [];
        LangUtil.superClassesRecursive(self, result);
        return result;
    }

    public static superClassesRecursive(self: PiClassifier, result: PiConcept[]): void {
        if (self instanceof PiConcept) {
            result.push(self.base.referred);
            LangUtil.superClassesRecursive(self.base.referred, result);
            for (let i of self.interfaces) {
                LangUtil.superClassesRecursive(i.referred, result);
            }
        }
        if (self instanceof PiInterface) {
            for (let i of self.base) {
                LangUtil.superClassesRecursive(i.referred, result);
            }
        }
    }

    public static superConcepts(self: PiClassifier): PiClassifier[] {
        const result: PiClassifier[] = [];
        LangUtil.superConceptsRecursive(self, result);
        return result;
    }

    private static superConceptsRecursive(self: PiClassifier, result: PiClassifier[]) {
        if (self instanceof PiConcept) {
            if(!!self.base) {
                result.push(self.base.referred);
                LangUtil.superConceptsRecursive(self.base.referred, result);
            }
            for (let i of self.interfaces) {
                result.push(i.referred);
                LangUtil.superConceptsRecursive(i.referred, result);
            }
        }
        if (self instanceof PiInterface) {
            for (let i of self.base) {
                result.push(i.referred);
                LangUtil.superConceptsRecursive(i.referred, result);
            }
        }
    }

    public static subConcepts(self: PiClassifier): PiConcept[] {
        const result: PiConcept[] = [];
        for (let cls of self.language.concepts) {
            if (LangUtil.superConcepts(cls).includes(self)) {
                result.push(cls);
            }
        }
        return result;
    }

    public static subConceptsIncludingSelf(self: PiClassifier): PiConcept[] {
        const result= LangUtil.subConcepts(self);
        if(self instanceof PiConcept) {
            result.push(self);
        }
        return result;
    }
}
