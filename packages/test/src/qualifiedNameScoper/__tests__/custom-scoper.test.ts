import { describe, test, expect, beforeEach } from "vitest";
import { ScoperTryoutEnvironment } from '../config/gen/ScoperTryoutEnvironment';
import { NamedPart, QualifiedName, ScoperTryout, Unit, UnitType1, UnitType2 } from '../language/gen';
import { FileHandler } from '../../utils/FileHandler';
import { AST, FreNodeReference } from '@freon4dsl/core';

describe("Testing Custom Scoper", () => {
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

		// create an empty QualifiedName to check the available names
		const secondQ: QualifiedName = QualifiedName.create({})
		AST.change( () => {
			firstQ.restName = secondQ;
		})
		expect(scoper.getVisibleNames(secondQ)).toStrictEqual([ 'Z_A', 'Z_B' ]);

	})
})
