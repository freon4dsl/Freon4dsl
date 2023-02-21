import { FreClassifier, FreConcept, MetaElementReference, FreInterface } from "../../languagedef/metalanguage";
import { CommonSuperTypeUtil } from "../../languagedef/checking/common-super/CommonSuperTypeUtil";

function concept(name: string): FreConcept {
    const result: FreConcept = new FreConcept();
    result.name = name;
    return result;
}

function interf(name: string): FreInterface {
    const result: FreInterface = new FreInterface();
    result.name = name;
    return result;
}

function conceptWithBase(name: string, base: FreConcept): FreConcept {
    const result = concept(name);
    result.base = MetaElementReference.create<FreConcept>(base, "FreClassifier");
    result.base.owner = result;
    return result;
}

function interfWithBases(name: string, base: FreInterface[]): FreInterface {
    const result = interf(name);
    for (const elem of base) {
        const newBase = MetaElementReference.create<FreInterface>(elem, "FreClassifier");
        newBase.owner = result;
        result.base.push(newBase);
    }
    return result;
}

function addInterfacesToConcept(con: FreConcept, intf: FreInterface[]) {
    for (const elem of intf) {
        const newBase = MetaElementReference.create<FreInterface>(elem, "FreClassifier");
        newBase.owner = con;
        con.interfaces.push(newBase);
    }
}

describe("Checking common super types algorithm", () => {

    test("no supers", () => {
        const myList: FreClassifier[] = [];
        myList.push(concept("AA"));
        myList.push(concept("BB"));
        myList.push(concept("CC"));
        const result: FreClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
        expect(result.length).toBe(0);
        // console.log(result.map(cls => cls.name).join(", "));
    });

    test("level 0 concepts", () => {
        let myList: FreClassifier[] = [];
        myList.push(concept("AA"));
        myList.push(concept("AA"));
        myList.push(concept("AA"));
        let result: FreClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
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
        let myList: FreClassifier[] = [];
        let myBase: FreConcept = concept("ZZ");
        myList.push(conceptWithBase("AA", myBase));
        myList.push(conceptWithBase("BB", myBase));
        myList.push(conceptWithBase("CC", myBase));
        let result: FreClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
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
        let myList: FreClassifier[] = [];
        myList.push(interf("AA"));
        myList.push(interf("AA"));
        myList.push(interf("AA"));
        let result: FreClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
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
        let myList: FreClassifier[] = [];
        const myBase1: FreInterface = interf("ZZ");
        const myBase2: FreInterface = interf("XX");
        myList.push(interfWithBases("AA", [myBase1, myBase2]));
        myList.push(interfWithBases("BB", [myBase1]));
        myList.push(interfWithBases("CC", [myBase1, myBase2]));
        let result: FreClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
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
        let myList: FreConcept[] = [];
        const baseConcept: FreConcept = concept("ZZ");
        myList.push(conceptWithBase("AA", baseConcept));
        myList.push(conceptWithBase("BB", baseConcept));
        myList.push(conceptWithBase("CC", baseConcept));
        const baseInterface1: FreInterface = interf("YY");
        const baseInterface2: FreInterface = interf("XX");
        for (const con of myList) {
            addInterfacesToConcept(con, [baseInterface1, baseInterface2]);
        }
        let result: FreClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
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
        let myList: FreClassifier[] = [];
        const myBase1: FreConcept = concept("ROOT");
        const myBase2: FreConcept = conceptWithBase("AA", myBase1);
        myList.push(conceptWithBase("KK", myBase2));
        myList.push(conceptWithBase("LL", conceptWithBase("BB", myBase1)));
        myList.push(conceptWithBase("MM", conceptWithBase("CC", myBase1)));
        let result: FreClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
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
        let myList: FreConcept[] = [];
        const myBase1: FreConcept = concept("ROOT");
        const myBase2: FreConcept = conceptWithBase("AA", myBase1);
        const myBase3: FreConcept = concept("SS");
        const baseInterface1: FreInterface = interf("YY");
        const baseInterface2: FreInterface = interf("XX");
        addInterfacesToConcept(myBase1, [baseInterface1]);
        addInterfacesToConcept(myBase3, [baseInterface2]);
        addInterfacesToConcept(myBase2, [baseInterface2]);

        //
        myList.push(conceptWithBase("KK", myBase2));
        myList.push(conceptWithBase("LL", conceptWithBase("BB", myBase1)));
        myList.push(conceptWithBase("MM", conceptWithBase("CC", myBase1)));
        let result: FreClassifier[] = CommonSuperTypeUtil.commonSuperType(myList);
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
