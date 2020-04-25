import { PiLangClass, PiLangConcept, PiLangInterface } from "../../../languagedef/metalanguage";

export class LangUtil {
    public static superClasses(self: PiLangConcept): PiLangClass[] {
        const result: PiLangClass[] = [];
        LangUtil.superClassesRecursive(self, result);
        return result;
    }

    public static superClassesRecursive(self: PiLangConcept, result: PiLangClass[]): void {
        if (self instanceof PiLangClass) {
            result.push(self.base.referedElement());
            LangUtil.superClassesRecursive(self.base.referedElement(), result);
            for (let i of self.interfaces) {
                LangUtil.superClassesRecursive(i.referedElement(), result);
            }
        }
        if (self instanceof PiLangInterface) {
            for (let i of self.interfaces) {
                LangUtil.superClassesRecursive(i.referedElement(), result);
            }
        }
    }

    public static superConcepts(self: PiLangConcept): PiLangConcept[] {
        const result: PiLangConcept[] = [];
        LangUtil.superConceptsRecursive(self, result);
        return result;
    }

    public static superConceptsRecursive(self: PiLangConcept, result: PiLangConcept[]) {
        if (self instanceof PiLangClass) {
            if(!!self.base) {
                result.push(self.base.referedElement());
                LangUtil.superConceptsRecursive(self.base.referedElement(), result);
            }
            for (let i of self.interfaces) {
                result.push(i.referedElement());
                LangUtil.superConceptsRecursive(i.referedElement(), result);
            }
        }
        if (self instanceof PiLangInterface) {
            for (let i of self.interfaces) {
                result.push(i.referedElement());
                LangUtil.superConceptsRecursive(i.referedElement(), result);
            }
        }
    }

    public static subClasses(self: PiLangConcept): PiLangClass[] {
        const result: PiLangClass[] = [];
        if(self instanceof PiLangClass) {
            result.push(self);
        }
        for (let cls of self.language.classes) {
            if (LangUtil.superConcepts(cls).includes(self)) {
                result.push(cls);
            }
        }
        return result;
    }
}
