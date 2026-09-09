/*
 * This set of tests is based on a simple model using scoper-model implementations.
 * All tests determine whether the declared nodes of a namespace are correct.
 */
import { beforeEach, describe, test, expect } from 'vitest';
import { type ScoperModel } from "./scoper-model/ScoperModel.js"
import { ModelCreator } from './ModelCreator.js';
import { initializeLanguage, type UnitB } from "./scoper-model/index.js"
import { type FreNamedNode, FreNode } from "../../ast/index.js"
import { FreLanguage } from '../../language/index.js';
import { createTestScoper } from "./createScoperHelper"
import { CompositeScoper } from "@freon4dsl/generic-scoper"


function printNames(set: Set<FreNamedNode>) {
	let names: string = '';
	set.forEach(x => names += x.name + ', ');
	console.log(names);
}

describe("NamespaceInfo declaredNames", () => {
	let model: ScoperModel;
    initializeLanguage()

    let mainScoper: CompositeScoper<FreNode>

    beforeEach(() => {
        mainScoper = createTestScoper()
        model = ModelCreator.createSimpleModel()
    })

	test(" model has all names as declared names", () => {
		// test namespace for 'model'
		// const namespace = NamespaceInfo.create(model)
        const namespace = mainScoper.registry.getOrCreate(model)
		const set: Set<FreNamedNode> = namespace.getDeclaredNodes(false);
		// printNames(set);
		// size = 50 grandchildren plus 10 children plus 2 units
		expect(set.size).toBe(62);
	})

	test(" unit has contained names as declared names", () => {
		// test namespace for 'unit'
		const namespace = mainScoper.registry.getOrCreate(model.findUnit('UnitA1'));
		const set: Set<FreNamedNode> = namespace.getDeclaredNodes(false);
		// printNames(set);
		// size = 25 grandchildren plus 5 children
		expect(set.size).toBe(30);
	})

	test(" concept has contained names as declared names", () => {
		// test namespace for 'concept'
		const unit: UnitB = model.findUnit('UnitB1') as UnitB;
		const concept = unit.childrenWithName.find(child => child.name === 'B_2');
		if (!!concept) {
			const namespace = mainScoper.registry.getOrCreate(concept);
			const set: Set<FreNamedNode> = namespace.getDeclaredNodes(false);
			// printNames(set);
			// size = 5 (grand)children
			expect(set.size).toBe(5);
		}
	})

	test(" when unit is namespace, names are hidden", () => {
		// set the type 'UnitA' to be a namespace, this hides all names of the form 'A_*_*'
		FreLanguage.getInstance().classifier('UnitA').isNamespace = true;
		// test namespace for 'model'
		const namespace = mainScoper.registry.getOrCreate(model);
		const set: Set<FreNamedNode> = namespace.getDeclaredNodes(false);
		// printNames(set);
		// size = 25 grandchildren plus 5 children plus 2 units
		expect(set.size).toBe(32);
		// unset namespace
		FreLanguage.getInstance().classifier('UnitA').isNamespace = false;
	})

	test(" when unit and children are namespaces, names are hidden", () => {
		// set the type 'UnitB' to be a namespace, this hides all names of the form 'B_*' and 'B_*_*'
		FreLanguage.getInstance().classifier('UnitB').isNamespace = true;
		// set the type 'NodeY' to be a namespace, this hides all names of the form 'A_*_*'.
		FreLanguage.getInstance().classifier('NodeY').isNamespace = true;
		// test namespace for 'model'
		const namespace = mainScoper.registry.getOrCreate(model);
		const set: Set<FreNamedNode> = namespace.getDeclaredNodes(false);
		// printNames(set);
		// size = no grandchildren plus 5 children plus 2 units
		expect(set.size).toBe(7);
		// unset namespaces
		FreLanguage.getInstance().classifier('UnitB').isNamespace = false;
		FreLanguage.getInstance().classifier('NodeY').isNamespace = false;
	})

	test(" when child of unit is namespace, names are hidden", () => {
		// set the type 'NodeX' to be a namespace
		FreLanguage.getInstance().classifier('NodeX').isNamespace = true;
		// set the type 'NodeY' to be a namespace
		FreLanguage.getInstance().classifier('NodeY').isNamespace = true;
		// test namespace for 'unit'
		const namespace = mainScoper.registry.getOrCreate(model.findUnit('UnitA1'));
		const set: Set<FreNamedNode> = namespace.getDeclaredNodes(false);
		// printNames(set);
		// size = no grandchildren, only 5 children
		expect(set.size).toBe(5);
		// unset namespaces
		FreLanguage.getInstance().classifier('NodeX').isNamespace = false;
		// set the type 'NodeY' to be a namespace
		FreLanguage.getInstance().classifier('NodeY').isNamespace = false;
	})
})
