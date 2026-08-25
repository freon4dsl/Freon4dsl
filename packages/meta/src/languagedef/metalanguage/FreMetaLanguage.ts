import { FreMetaLangElement, FreMetaClassifier, FreMetaModelDescription, FreMetaUnitDescription, FreMetaInterface, FreMetaConcept, FreMetaPrimitiveType } from "./internal.js"

export class FreMetaLanguage extends FreMetaLangElement {
    concepts: FreMetaConcept[] = [];
    interfaces: FreMetaInterface[] = [];
    // @ts-ignore
    modelConcept: FreMetaModelDescription;
    units: FreMetaUnitDescription[] = [];
    id: string = "";
    key: string = "";
    usedLanguages: string[] = [];

    constructor() {
        super();
        this.name = "";
    }

    get NAME(): string {
        return this._name;
    }
    get name(): string {
        if (!!this.modelConcept) {
            return this.modelConcept.name;
        } else {
            return this._name;
        }
    }
    set name(v: string) {
        this._name = v;
    }

    classifiers(): FreMetaClassifier[] {
        const result: FreMetaClassifier[] = this.concepts;
        return result.concat(this.interfaces).concat(this.units);
    }

    conceptsAndInterfaces(): FreMetaClassifier[] {
        const result: FreMetaClassifier[] = this.concepts;
        return result.concat(this.interfaces);
    }

    findConcept(name: string): FreMetaConcept | undefined {
        return this.concepts.find((con) => con.name === name);
    }

    findInterface(name: string): FreMetaInterface | undefined {
        return this.interfaces.find((con) => con.name === name);
    }

    findClassifier(name: string): FreMetaClassifier | undefined {
        let result: FreMetaClassifier | undefined;
        result = this.findConcept(name);
        if (result === undefined) {
            result = this.findInterface(name);
        }
        if (result === undefined) {
            result = this.findUnitDescription(name);
        }
        if (result === undefined) {
            result = this.findBasicType(name);
        }
        return result;
    }

    findBasicType(name: string): FreMetaClassifier {
        // If not found, this method returns $freAny
        return FreMetaPrimitiveType.find(name);
    }

    findUnitDescription(name: string): FreMetaUnitDescription | undefined {
        return this.units.find((u) => u.name === name);
    }
}
