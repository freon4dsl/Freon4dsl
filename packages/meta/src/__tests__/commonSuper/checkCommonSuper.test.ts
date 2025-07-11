import {
    FreMetaClassifier,
    FreMetaConcept,
    MetaElementReference,
    FreMetaInterface,
} from '../../languagedef/metalanguage/index.js';
import { CommonSuperTypeUtil } from '../../languagedef/checking/common-super/CommonSuperTypeUtil.js';
import { describe, test, expect } from "vitest";

function concept(name: string): FreMetaConcept {
    const result: FreMetaConcept = new FreMetaConcept();
    result.name = name;
    return result;
}

function interf(name: string): FreMetaInterface {
    const result: FreMetaInterface = new FreMetaInterface();
    result.name = name;
    return result;
}

function conceptWithBase(name: string, base: FreMetaConcept): FreMetaConcept {
    const result = concept(name);
    result.base = MetaElementReference.create<FreMetaConcept>(base);
    result.base.owner = result;
    return result;
}

function interfWithBases(name: string, base: FreMetaInterface[]): FreMetaInterface {
    const result = interf(name);
    for (const elem of base) {
        const newBase = MetaElementReference.create<FreMetaInterface>(elem);
        newBase.owner = result;
        result.base.push(newBase);
    }
    return result;
}

function addInterfacesToConcept(con: FreMetaConcept, intf: FreMetaInterface[]) {
    for (const elem of intf) {
        const newBase = MetaElementReference.create<FreMetaInterface>(elem);
        newBase.owner = con;
        con.interfaces.push(newBase);
    }
}

describe("Checking common super types algorithm", () => {
    test("no supers", () => {
        const myList: FreMetaClassifier[] = [];
        myList.push(concept("AA"));
        myList.push(concept("BB"));
        myList.push(concept("CC"));
        const result: FreMetaClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
        expect(result.length).toBe(0);
        // console.log(result.map(cls => cls.name).join(", "));
    });

    test("level 0 concepts", () => {
        let myList: FreMetaClassifier[] = [];
        myList.push(concept("AA"));
        myList.push(concept("AA"));
        myList.push(concept("AA"));
        let result: FreMetaClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
        expect(result.length).toBe(1);
        expect(result[0]).toBe(myList[0]);
        // console.log(result.map(cls => cls.name).join(", "));
        myList = [];
        myList.push(concept("AA"));
        myList.push(concept("AA"));
        myList.push(concept("BB"));
        result = CommonSuperTypeUtil.commonSuperType(myList);
        expect(result.length).toBe(0);
    });

    test("level 1 concepts", () => {
        let myList: FreMetaClassifier[] = [];
        let myBase: FreMetaConcept = concept("ZZ");
        myList.push(conceptWithBase("AA", myBase));
        myList.push(conceptWithBase("BB", myBase));
        myList.push(conceptWithBase("CC", myBase));
        let result: FreMetaClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
        expect(result.length).toBe(1);
        expect(result[0]).toBe(myBase);
        // console.log(result.map(cls => cls.name).join(", "));
        myList = [];
        myBase = concept("ZZ");
        myList.push(conceptWithBase("AA", myBase));
        myList.push(conceptWithBase("BB", myBase));
        myList.push(concept("CC"));
        result = CommonSuperTypeUtil.commonSuperType(myList);
        expect(result.length).toBe(0);
        //
        myList = [];
        myBase = concept("ZZ");
        myList.push(conceptWithBase("AA", myBase));
        myList.push(conceptWithBase("AA", myBase));
        myList.push(concept("AA"));
        result = CommonSuperTypeUtil.commonSuperType(myList);
        expect(result[0].name).toBe("AA");
    });

    test("level 0 interfaces", () => {
        let myList: FreMetaClassifier[] = [];
        myList.push(interf("AA"));
        myList.push(interf("AA"));
        myList.push(interf("AA"));
        let result: FreMetaClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
        expect(result.length).toBe(1);
        expect(result[0]).toBe(myList[0]);
        // console.log(result.map(cls => cls.name).join(", "));
        myList = [];
        myList.push(interf("AA"));
        myList.push(interf("BB"));
        result = CommonSuperTypeUtil.commonSuperType(myList);
        expect(result.length).toBe(0);
    });

    test("level 1 interfaces", () => {
        let myList: FreMetaClassifier[] = [];
        const myBase1: FreMetaInterface = interf("ZZ");
        const myBase2: FreMetaInterface = interf("XX");
        myList.push(interfWithBases("AA", [myBase1, myBase2]));
        myList.push(interfWithBases("BB", [myBase1]));
        myList.push(interfWithBases("CC", [myBase1, myBase2]));
        let result: FreMetaClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
        expect(result.length).toBe(1);
        expect(result[0]).toBe(myBase1);
        // console.log("COMMON SUPER: " + result.map(cls => cls.name).join(", "));
        myList = [];
        myList.push(interfWithBases("AA", [myBase2]));
        myList.push(interfWithBases("BB", [myBase2]));
        myList.push(interf("CC"));
        result = CommonSuperTypeUtil.commonSuperType(myList);
        expect(result.length).toBe(0);
        //
        myList = [];
        myList.push(interfWithBases("AA", [myBase2, myBase1]));
        myList.push(interfWithBases("AA", [myBase2]));
        myList.push(interf("AA"));
        result = CommonSuperTypeUtil.commonSuperType(myList);
        expect(result[0].name).toBe("AA");
        //
        myList = [];
        myList.push(interfWithBases("AA", [myBase1, myBase2]));
        myList.push(interfWithBases("BB", [myBase2, myBase1]));
        myList.push(interfWithBases("CC", [myBase1, myBase2]));
        result = CommonSuperTypeUtil.commonSuperType(myList);
        expect(result.length).toBe(2);
        expect(result.includes(myBase1)).toBeTruthy();
        expect(result.includes(myBase2)).toBeTruthy();
    });

    test("level 1 concepts and interfaces", () => {
        let myList: FreMetaConcept[] = [];
        const baseConcept: FreMetaConcept = concept("ZZ");
        myList.push(conceptWithBase("AA", baseConcept));
        myList.push(conceptWithBase("BB", baseConcept));
        myList.push(conceptWithBase("CC", baseConcept));
        const baseInterface1: FreMetaInterface = interf("YY");
        const baseInterface2: FreMetaInterface = interf("XX");
        for (const con of myList) {
            addInterfacesToConcept(con, [baseInterface1, baseInterface2]);
        }
        let result: FreMetaClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
        // console.log("COMMON SUPER: " + result.map(cls => cls.name).join(", "));
        expect(result.length).toBe(3);
        expect(result.includes(baseConcept)).toBeTruthy();
        expect(result.includes(baseInterface1)).toBeTruthy();
        expect(result.includes(baseInterface2)).toBeTruthy();
        //
        myList = [];
        myList.push(conceptWithBase("AA", baseConcept));
        myList.push(concept("BB"));
        myList.push(conceptWithBase("CC", baseConcept));
        myList.forEach((con, index) => {
            if (index % 2) {
                addInterfacesToConcept(con, [baseInterface1, baseInterface2]);
            } else {
                addInterfacesToConcept(con, [baseInterface1]);
            }
        });
        result = CommonSuperTypeUtil.commonSuperType(myList);
        // console.log("COMMON SUPER: " + result.map(cls => cls.name).join(", "));
        expect(result.length).toBe(1);
        expect(result.includes(baseConcept)).not.toBeTruthy();
        expect(result.includes(baseInterface1)).toBeTruthy();
        expect(result.includes(baseInterface2)).not.toBeTruthy();
    });

    test("level 2 concepts", () => {
        let myList: FreMetaClassifier[] = [];
        const myBase1: FreMetaConcept = concept("ROOT");
        const myBase2: FreMetaConcept = conceptWithBase("AA", myBase1);
        myList.push(conceptWithBase("KK", myBase2));
        myList.push(conceptWithBase("LL", conceptWithBase("BB", myBase1)));
        myList.push(conceptWithBase("MM", conceptWithBase("CC", myBase1)));
        let result: FreMetaClassifier[];
        // expect(result.length).toBe(1);
        // expect(result[0]).toBe(myBase1);
        // console.log("COMMON SUPER: " + result.map(cls => cls.name).join(", "));
        myList = [];
        myList.push(conceptWithBase("KK", myBase2));
        myList.push(conceptWithBase("LL", myBase2));
        myList.push(conceptWithBase("MM", myBase2));
        result = CommonSuperTypeUtil.commonSuperType(myList);
        expect(result.length).toBe(2);
        expect(result.includes(myBase2)).toBeTruthy();
        expect(result.includes(myBase1)).toBeTruthy();
        // console.log("COMMON SUPER: " + result.map(cls => cls.name).join(", "));
    });

    test("level 2 concepts and interfaces", () => {
        let myList: FreMetaConcept[] = [];
        const myBase1: FreMetaConcept = concept("ROOT");
        const myBase2: FreMetaConcept = conceptWithBase("AA", myBase1);
        const myBase3: FreMetaConcept = concept("SS");
        const baseInterface1: FreMetaInterface = interf("YY");
        const baseInterface2: FreMetaInterface = interf("XX");
        addInterfacesToConcept(myBase1, [baseInterface1]);
        addInterfacesToConcept(myBase3, [baseInterface2]);
        addInterfacesToConcept(myBase2, [baseInterface2]);

        //
        myList.push(conceptWithBase("KK", myBase2));
        myList.push(conceptWithBase("LL", conceptWithBase("BB", myBase1)));
        myList.push(conceptWithBase("MM", conceptWithBase("CC", myBase1)));
        let result: FreMetaClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
        // console.log("COMMON SUPER: " + result.map(cls => cls.name).join(", "));
        expect(result.length).toBe(2);
        expect(result.includes(myBase1)).toBeTruthy();
        expect(result.includes(baseInterface1)).toBeTruthy();
        //
        // different base concepts that implement the same interface
        myList = [];
        myList.push(conceptWithBase("KK", myBase2));
        myList.push(conceptWithBase("LL", myBase3));
        result = CommonSuperTypeUtil.commonSuperType(myList);
        // console.log("COMMON SUPER: " + result.map(cls => cls.name).join(", "));
        expect(result.length).toBe(1);
        expect(result.includes(baseInterface2)).toBeTruthy();
    });
});
