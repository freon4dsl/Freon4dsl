import { describe, test, expect, beforeEach } from "vitest";
import { ScoperTryoutEnvironment } from '../config/gen/ScoperTryoutEnvironment';
import { NamedPart, QualifiedName, ScoperTryout, Unit, UnitType1, UnitType2 } from '../language/gen';
import { FileHandler } from '../../utils/FileHandler';
import { AST, FreNodeReference, qualifiedName } from '@freon4dsl/core';

// These tests only work with an adjustment to the generated scoper:
//     getAlternativeScope(node: FreNode): FreNamespace {
//         if (!!node && node instanceof QualifiedName) {
//             // use alternative scope 'container'
//             let container = node.freOwner();
//             if (!!container) {
//                 if (container instanceof QualifiedName) {
//                     return FreNamespace.create(container.part.referred);
//                 } else {
//                     return FreNamespace.create(container);
//                 }
//             } else {
//                 console.error("getAlternativeScope: no container found.");
//             }
//         }
//         return null;
//     }
//
// The problem is that the scope definition must be different depending on the owner of a QualifiedName.
// I have yet to find how to add this type of code to the Custom<Scoper>.ts.
// Maybe the 'FreScoper' interface should be extended to include 'getAlternativeScope',
// 'hasAlternativeScope', and 'additionalNamespaces'. Or, maybe we could introduce another type of entry
// in the .scope file to accommodate this.


describe.skip("Testing Custom Scoper", () => {
	const reader = ScoperTryoutEnvironment.getInstance().reader;
	const writer = ScoperTryoutEnvironment.getInstance().writer;
	const scoper = ScoperTryoutEnvironment.getInstance().scoper;
	const fileHandler = new FileHandler();
	let model: ScoperTryout | undefined = undefined;

	beforeEach(() => {
		model = ScoperTryout.create({name: 'test'});
		let fileName: string = "unit1_1.uni";
		let input: string = fileHandler.stringFromFile("src/qualifiedNameScoper/__inputs__/" + fileName);
		reader.readFromString(input, "Unit", model, fileName);
		fileName = "unit1_2.uni";
		input = fileHandler.stringFromFile("src/qualifiedNameScoper/__inputs__/" + fileName);
		reader.readFromString(input, "Unit", model, fileName);
		// model.getUnits().forEach(unit => console.log(writer.writeToString(unit)));
	})

	test(" QualifiedName has names from unit", () => {
		const referenceUnit = new UnitType2("some-id");
		AST.change( () => {
			model.addUnit(referenceUnit)
			referenceUnit.name = "TestRefs1";
			referenceUnit.imports.push(FreNodeReference.create<Unit>("unit1_1", "Unit"));
		})
		// console.log(scoper.getVisibleNames(referenceUnit));
		expect(scoper.getVisibleNames(referenceUnit)).toStrictEqual([ 'Z', 'Y', 'X', 'V', 'W', 'U', 'TestRefs1', 'unit1_1', 'unit1_2' ]);
		// console.log(scoper.getVisibleNames(referenceUnit, "NamedPart"));
		expect(scoper.getVisibleNames(referenceUnit, "NamedPart")).toStrictEqual([ 'Z', 'Y', 'X', 'V', 'W', 'U']);

		// create an empty QualifiedName to check the available names
		const firstQ: QualifiedName = QualifiedName.create({})
		AST.change( () => {
			referenceUnit.myReferences.push(firstQ);
		})
		expect(scoper.getVisibleNames(firstQ)).toStrictEqual([ 'Z', 'Y', 'X', 'V', 'W', 'U' ]);
	})

	test(" QualifiedName has names from previous", () => {
		const referenceUnit = new UnitType2("some-id");
		AST.change( () => {
			model.addUnit(referenceUnit)
			referenceUnit.name = "TestRefs1";
			referenceUnit.imports.push(FreNodeReference.create<Unit>("unit1_1", "Unit"));
		})
		// console.log(scoper.getVisibleNames(referenceUnit));
		expect(scoper.getVisibleNames(referenceUnit)).toStrictEqual([ 'Z', 'Y', 'X', 'V', 'W', 'U', 'TestRefs1', 'unit1_1', 'unit1_2' ]);
		// console.log(scoper.getVisibleNames(referenceUnit, "NamedPart"));
		expect(scoper.getVisibleNames(referenceUnit, "NamedPart")).toStrictEqual([ 'Z', 'Y', 'X', 'V', 'W', 'U']);

		// create an empty QualifiedName to check the available names
		const firstQ: QualifiedName = QualifiedName.create({})
		AST.change( () => {
			referenceUnit.myReferences.push(firstQ);
		})
		expect(scoper.getVisibleNames(firstQ)).toStrictEqual([ 'Z', 'Y', 'X', 'V', 'W', 'U' ]);

		// add a part to the QualifiedName
		AST.change( () => {
			firstQ.part = FreNodeReference.create<NamedPart>("Z", "NamedPart");
		})
		expect(firstQ.part.referred).not.toBeNull;
		expect(firstQ.part.referred).not.toBeUndefined;
		expect(firstQ.part.referred).toBe((model.findUnit('unit1_1') as UnitType1).content.find(xx => xx.name === "Z"));

		// create an empty QualifiedName to check the available names
		const secondQ: QualifiedName = QualifiedName.create({})
		AST.change( () => {
			firstQ.restName = secondQ;
		})
		expect(scoper.getVisibleNames(secondQ)).toStrictEqual([ 'Z_A', 'Z_B' ]);

		const elems = scoper.getVisibleElements(secondQ, 'NamedPart');
		const za: NamedPart = elems.find(e => e.name === "Z_A") as NamedPart;
		// add a part to the QualifiedName
		AST.change( () => {
			secondQ.part = FreNodeReference.create<NamedPart>('Z_A', "NamedPart");
		})
		expect(secondQ.part.referred).not.toBeNull;
		expect(secondQ.part.referred).not.toBeUndefined;
		expect(secondQ.part.referred).toBe((model.findUnit('unit1_1') as UnitType1).content.find(xx => xx.name === "Z").subParts.find(xx => xx.name === "Z_A"));

		// create an empty QualifiedName to check the available names
		const thirdQ: QualifiedName = QualifiedName.create({})
		AST.change( () => {
			secondQ.restName = thirdQ;
		})
		// console.log(writer.writeToString(referenceUnit))
		expect(scoper.getVisibleNames(thirdQ)).toStrictEqual([ 'Z_A_A', 'Z_A_B' ]);

	})
})
