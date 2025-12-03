import { describe, test, expect, beforeEach } from "vitest";
import { ScoperTryoutEnvironment } from '../freon/config/ScoperTryoutEnvironment.js';
import { NamedPart, QualifiedName, ScoperTryout, Unit, UnitType1, UnitType2 } from '../freon/language/index.js';
import { FileHandler } from '../../utils/FileHandler.js';
import { AST, FreNamedNode, FreNodeReference } from '@freon4dsl/core';
import { getVisibleNames } from '../../utils/HelperFunctions.js';

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

	// The model has three units: unit1_1, unit1_2, and referenceUnit (named 'some-id').
	// Unit 'unit1_1' imports 'unit1_2'
	function startFQN(): QualifiedName {
		const referenceUnit = new UnitType2('some-id');
		AST.change(() => {
			model.addUnit(referenceUnit);
			referenceUnit.name = 'TestRefs1';
			referenceUnit.imports.push(FreNodeReference.create<Unit>('unit1_1', 'Unit'));
		});
		expect(referenceUnit.imports[0].referred?.name).toBe('unit1_1');

		const unit1_1 = model.getUnits().find(unit => unit.name === 'unit1_1');
		// expect(null).toBeUndefined();
		expect(unit1_1).not.toBeNull();
		expect(unit1_1).not.toBeUndefined();
		expect((unit1_1 as UnitType1).imports[0]).not.toBeUndefined();
		expect(getVisibleNames(scoper.getVisibleNodes(unit1_1))).toStrictEqual([
			// declared nodes in unit1_1
			"Z",
			"Y",
			"X",
			"V",
			"W",
			"U",
			// parent nodes of unit1_1
			"TestRefs1",
			"unit1_1",
			"unit1_2",
			// imported nodes from unit1_2
			"A",
			"B",
			"C",
			"D",
			"E",
			"F",
			"G",]);

		const visNodes = scoper.getVisibleNodes(referenceUnit);
		const visNamedParts = scoper.getVisibleNodes(referenceUnit, 'NamedPart');
		expect(getVisibleNames(visNodes)).toStrictEqual([
			// parent nodes of referenceUnit
			'TestRefs1', 'unit1_1', 'unit1_2',
			// recursively imported nodes from unit1_2
			"A",
			"B",
			"C",
			"D",
			"E",
			"F",
			"G",
			// imported nodes from unit1_1
			'Z', 'Y', 'X', 'V', 'W', 'U'
		]);
		expect(getVisibleNames(visNamedParts)).toStrictEqual([
			"A",
			"B",
			"C",
			"D",
			"E",
			"F",
			"G",
			'Z', 'Y', 'X', 'V', 'W', 'U'
]);

		// create an empty QualifiedName to check the available names
		const firstQ: QualifiedName = QualifiedName.create({});
		AST.change(() => {
			referenceUnit.myReferences.push(firstQ);
		});
		// the container of the reference is a UnitType2, namely 'referenceUnit', thus the visibleNodes should equal those
		// of 'referenceUnit'
		expect(getVisibleNames(scoper.getVisibleNodes(firstQ))).toStrictEqual(getVisibleNames(visNodes));
		return firstQ;
	}

	function addPart(firstQ: QualifiedName, nodeToAdd: NamedPart) {
		AST.change(() => {
			firstQ.part = FreNodeReference.create<NamedPart>(nodeToAdd.name, 'NamedPart');
		});
		expect(firstQ.part.referred).not.toBeNull;
		expect(firstQ.part.referred).not.toBeUndefined;
		expect(firstQ.part.referred).toBe(nodeToAdd);
	}

	test(" QualifiedName has names from unit", () => {
		startFQN();
	})

	test(" QualifiedName has names from previous", () => {
		const firstQ: QualifiedName = startFQN();

		// add a part to the first QualifiedName
		const nodeToAdd = (model.findUnit('unit1_1') as UnitType1).content.find(xx => xx.name === "Z")
		addPart(firstQ, nodeToAdd);
		expect(getVisibleNames(scoper.getVisibleNodes(firstQ.part))).toStrictEqual([   "TestRefs1",
			"unit1_1",
			"unit1_2",
			"A",
			"B",
			"C",
			"D",
			"E",
			"F",
			"G",
			"Z",
			"Y",
			"X",
			"V",
			"W",
			"U", ]);

		// create the next QualifiedName (empty) to check the available names
		const secondQ: QualifiedName = QualifiedName.create({})
		AST.change( () => {
			firstQ.restName = secondQ;
		})
		expect(getVisibleNames(scoper.getVisibleNodes(secondQ))).toStrictEqual([ 'Z_A', 'Z_B' ]);

		// add a part to the next QualifiedName, and check its reference
		const za: NamedPart = scoper.getVisibleNodes(secondQ, 'NamedPart').find(e => e.name === "Z_A") as NamedPart;
		addPart(secondQ, za);
		const Z_A_node: FreNamedNode = (model.findUnit('unit1_1') as UnitType1).content.find(xx => xx.name === "Z").subParts.find(xx => xx.name === "Z_A")
		expect(Z_A_node).not.toBeNull;
		expect(Z_A_node).not.toBeUndefined;
		expect(Z_A_node).toBe(za);

		// create the next QualifiedName (empty) to check the available names
		const thirdQ: QualifiedName = QualifiedName.create({})
		AST.change( () => {
			secondQ.restName = thirdQ;
		})
		expect(getVisibleNames(scoper.getVisibleNodes(thirdQ))).toStrictEqual([ 'Z_A_A', 'Z_A_B' ]);

		// add a part to the next QualifiedName, and check its reference
		const zab: NamedPart = scoper.getVisibleNodes(thirdQ, 'NamedPart').find(e => e.name === "Z_A_B") as NamedPart;
		addPart(thirdQ, zab);
		const Z_A_B_node: FreNamedNode = (model.findUnit('unit1_1') as UnitType1).content.find(xx => xx.name === "Z").subParts.find(xx => xx.name === "Z_A").subParts.find(xx => xx.name === "Z_A_B")
		expect(Z_A_B_node).not.toBeNull;
		expect(Z_A_B_node).not.toBeUndefined;
		expect(Z_A_B_node).toBe(zab);

		// create the next QualifiedName (empty) to check the available names
		const fourthQ: QualifiedName = QualifiedName.create({})
		AST.change( () => {
			thirdQ.restName = fourthQ;
		})
		expect(getVisibleNames(scoper.getVisibleNodes(fourthQ))).toStrictEqual([ ]);
	})
})
