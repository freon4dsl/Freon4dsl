import { PiClassifier, PiConcept, PiElementReference, PiInterface } from "../../languagedef/metalanguage";
import { CommonSuperTypeUtil } from "../../utils/common-super/CommonSuperTypeUtil";

function concept(name: string): PiConcept {
    const result: PiConcept = new PiConcept();
    result.name = name;
    return result;
}

function interf(name: string): PiInterface {
    const result: PiInterface = new PiInterface();
    result.name = name;
    return result;
}

function conceptWithBase(name: string, base: PiConcept): PiConcept {
    const result = concept(name);
    result.base = PiElementReference.create<PiConcept>(base, "PiClassifier");
    result.base.owner = result;
    return result;
}

function interfWithBases(name: string, base: PiInterface[]): PiInterface {
    const result = interf(name);
    for (const elem of base) {
        const newBase = PiElementReference.create<PiInterface>(elem, "PiClassifier");
        newBase.owner = result;
        result.base.push(newBase);
    }
    return result;
}

function addInterfacesToConcept(con: PiConcept, intf: PiInterface[]) {
    for (const elem of intf) {
        const newBase = PiElementReference.create<PiInterface>(elem, "PiClassifier");
        newBase.owner = con;
        con.interfaces.push(newBase);
    }
}

describe("Checking common super types algorithm", () => {

    test("no supers", () => {
        const myList: PiClassifier[] = [];
        myList.push(concept("AA"));
        myList.push(concept("BB"));
        myList.push(concept("CC"));
        const result: PiClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
        expect(result.length).toBe(0);
        // console.log(result.map(cls => cls.name).join(", "));
    });

    test("level 0 concepts", () => {
        let myList: PiClassifier[] = [];
        myList.push(concept("AA"));
        myList.push(concept("AA"));
        myList.push(concept("AA"));
        let result: PiClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
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
        let myList: PiClassifier[] = [];
        let myBase: PiConcept = concept("ZZ");
        myList.push(conceptWithBase("AA", myBase));
        myList.push(conceptWithBase("BB", myBase));
        myList.push(conceptWithBase("CC", myBase));
        let result: PiClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
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
        let myList: PiClassifier[] = [];
        myList.push(interf("AA"));
        myList.push(interf("AA"));
        myList.push(interf("AA"));
        let result: PiClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
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
        let myList: PiClassifier[] = [];
        let myBase1: PiInterface = interf("ZZ");
        let myBase2: PiInterface = interf("XX");
        myList.push(interfWithBases("AA", [myBase1, myBase2]));
        myList.push(interfWithBases("BB", [myBase1]));
        myList.push(interfWithBases("CC", [myBase1, myBase2]));
        let result: PiClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
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
        let myList: PiConcept[] = [];
        let baseConcept: PiConcept = concept("ZZ");
        myList.push(conceptWithBase("AA", baseConcept));
        myList.push(conceptWithBase("BB", baseConcept));
        myList.push(conceptWithBase("CC", baseConcept));
        let baseInterface1: PiInterface = interf("YY");
        let baseInterface2: PiInterface = interf("XX");
        for (const con of myList) {
            addInterfacesToConcept(con, [baseInterface1, baseInterface2]);
        }
        let result: PiClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
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
        let myList: PiClassifier[] = [];
        const myBase1: PiConcept = concept("ROOT");
        const myBase2: PiConcept = conceptWithBase("AA", myBase1);
        myList.push(conceptWithBase("KK", myBase2));
        myList.push(conceptWithBase("LL", conceptWithBase("BB", myBase1)));
        myList.push(conceptWithBase("MM", conceptWithBase("CC", myBase1)));
        let result: PiClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
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
        let myList: PiConcept[] = [];
        const myBase1: PiConcept = concept("ROOT");
        const myBase2: PiConcept = conceptWithBase("AA", myBase1);
        const myBase3: PiConcept = concept("SS");
        const baseInterface1: PiInterface = interf("YY");
        const baseInterface2: PiInterface = interf("XX");
        addInterfacesToConcept(myBase1, [baseInterface1]);
        addInterfacesToConcept(myBase3, [baseInterface2]);
        addInterfacesToConcept(myBase2, [baseInterface2]);

        //
        myList.push(conceptWithBase("KK", myBase2));
        myList.push(conceptWithBase("LL", conceptWithBase("BB", myBase1)));
        myList.push(conceptWithBase("MM", conceptWithBase("CC", myBase1)));
        let result: PiClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
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
