import { beforeEach, describe, test, expect } from 'vitest';

import { FileHandler } from './FileHandler';
import { ScoperTestModel } from '@freon4dsl/samples-scoper-test';
import { ScoperTestModelEnvironment } from '../config/gen/ScoperTestModelEnvironment';
import { FreNamedNode, FreCompositeScoper } from '@freon4dsl/core';
import { IAstNode, UnitA, UnitB } from '../language/gen';


function doRecursive(child: IAstNode, scoper: FreCompositeScoper, visFromModel: FreNamedNode[]) {
	child.childrenNoName.forEach(grandchild => {
		const subList = scoper.getVisibleElements(grandchild);
		expect(visFromModel).toStrictEqual(subList);
		doRecursive(grandchild, scoper, visFromModel);
	});
	child.childrenWithName.forEach(grandchild => {
		const subList = scoper.getVisibleElements(grandchild);
		expect(visFromModel).toStrictEqual(subList);
		doRecursive(grandchild, scoper, visFromModel);
	});
}

describe("Scoper Test 1:", () => {
	const reader = ScoperTestModelEnvironment.getInstance().reader;
	const writer = ScoperTestModelEnvironment.getInstance().writer;
	const scoper = ScoperTestModelEnvironment.getInstance().scoper;
	const fileHandler = new FileHandler();
	let model: ScoperTestModel | undefined = undefined;

	beforeEach(() => {
		model = ScoperTestModel.create({name: 'test1'});
		let fileName: string = "A1.uni";
		let input: string = fileHandler.stringFromFile(fileName);
		reader.readFromString(input, "Unit", model, fileName);
		// fileName = "unit1_2.uni";
		// input = fileHandler.stringFromFile("src/__inputs__/" + fileName);
		// reader.readFromString(input, "Unit", model, fileName);
		// // model.getUnits().forEach(unit => console.log(writer.writeToString(unit)));
		expect(model).not.toBeNull;
		expect(model).not.toBeUndefined;
	})

	test(" all Names are visible everywhere", () => {
		expect(model).not.toBeNull;
		expect(model).not.toBeUndefined;

		const visFromModel: FreNamedNode[] = scoper.getVisibleElements(model);

		model.getUnits().forEach(unit => {
			const visFromUnit: FreNamedNode[] = scoper.getVisibleElements(unit);
			expect(visFromUnit).toStrictEqual(visFromModel);
			// one level deeper
			if (unit instanceof UnitA) {
				doRecursive(unit, scoper, visFromModel);
			}
			if (unit instanceof UnitB) {
				doRecursive(unit, scoper, visFromModel);
			}
		})
	})
})
