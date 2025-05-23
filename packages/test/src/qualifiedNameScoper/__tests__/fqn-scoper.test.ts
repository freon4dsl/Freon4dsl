import { describe, test, expect, beforeEach } from "vitest";
import { ScoperTryoutEnvironment } from '../config/gen/ScoperTryoutEnvironment';
import { NamedPart, QualifiedName, ScoperTryout, Unit, UnitType1, UnitType2 } from '../language/gen';
import { FileHandler } from '../../utils/FileHandler';
import { AST, FreNamedNode, FreNodeReference } from '@freon4dsl/core';
import { getVisibleNames } from '../../utils/HelperFunctions';

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

	function startFQN(): QualifiedName {
		const referenceUnit = new UnitType2('some-id');
		AST.change(() => {
			model.addUnit(referenceUnit);
			referenceUnit.name = 'TestRefs1';
			referenceUnit.imports.push(FreNodeReference.create<Unit>('unit1_1', 'Unit'));
		});
		// console.log(getVisibleNames(scoper, referenceUnit));
		scoper.getVisibleNodes(referenceUnit);
		expect(getVisibleNames(scoper, referenceUnit)).toStrictEqual(['Z', 'Y', 'X', 'V', 'W', 'U', 'TestRefs1', 'unit1_1', 'unit1_2']);
		// console.log(getVisibleNames(scoper, referenceUnit, "NamedPart"));
		expect(getVisibleNames(scoper, referenceUnit, 'NamedPart')).toStrictEqual(['Z', 'Y', 'X', 'V', 'W', 'U']);

		// create an empty QualifiedName to check the available names
		const firstQ: QualifiedName = QualifiedName.create({});
		AST.change(() => {
			referenceUnit.myReferences.push(firstQ);
		});
		expect(getVisibleNames(scoper, firstQ)).toStrictEqual(['Z', 'Y', 'X', 'V', 'W', 'U']);
		return firstQ
	}

	test(" QualifiedName has names from unit", () => {
		startFQN();
	})

	test(" QualifiedName has names from previous", () => {
		const firstQ: QualifiedName = startFQN();

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
		expect(getVisibleNames(scoper, secondQ)).toStrictEqual([ 'Z_A', 'Z_B' ]);

		const elems = scoper.getVisibleNodes(secondQ, 'NamedPart');
		const za: NamedPart = elems.find(e => e.name === "Z_A") as NamedPart;
		// add a part to the QualifiedName
		AST.change( () => {
			secondQ.part = FreNodeReference.create<NamedPart>('Z_A', "NamedPart");
		})
		expect(secondQ.part.referred).not.toBeNull;
		expect(secondQ.part.referred).not.toBeUndefined;
		const Z_A_node: FreNamedNode = (model.findUnit('unit1_1') as UnitType1).content.find(xx => xx.name === "Z").subParts.find(xx => xx.name === "Z_A")
		expect(Z_A_node).not.toBeNull;
		expect(Z_A_node).not.toBeUndefined;
		expect(Z_A_node).toBe(za);
		expect(secondQ.part.referred).toBe(Z_A_node);

		// create an empty QualifiedName to check the available names
		const thirdQ: QualifiedName = QualifiedName.create({})
		AST.change( () => {
			secondQ.restName = thirdQ;
		})
		// console.log(writer.writeToString(referenceUnit))
		expect(getVisibleNames(scoper, thirdQ)).toStrictEqual([ 'Z_A_A', 'Z_A_B' ]);

	})
})
