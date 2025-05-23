import { beforeEach, describe, test, expect } from 'vitest';
import { ScoperModel } from './scoper-model/ScoperModel';
import { ModelCreator } from './ModelCreator';
import { initializeLanguage, UnitB } from './scoper-model';
import { FreNamespace } from '../../scoper';
import { FreNamedNode } from '../../ast';
import { FreLanguage } from '../../language';


function printNames(set: Set<FreNamedNode>) {
	let names: string = '';
	set.forEach(x => names += x.name + ', ');
	console.log(names);
}

describe("FreNamespace visibleNames", () => {
	let model: ScoperModel;
	initializeLanguage();

	beforeEach(() => {
		// create a simple model where some nodes are namespaces and some are not
		model = ModelCreator.createSimpleModel();
	});

	test(" model has all names as visible names", () => {
		// test namespace for 'model'
		const namespace = FreNamespace.create(model);
		const set: Set<FreNamedNode> = namespace.getVisibleNodes();
		// printNames(set);
		// size = 50 grandchildren plus 10 children plus 2 units
		expect(set.size).toBe(62);
	})

	test(" unit adds names of parent", () => {
		// test namespace for 'unit'
		const namespace = FreNamespace.create(model.findUnit('UnitA1'));
		const set: Set<FreNamedNode> = namespace.getVisibleNodes();
		// printNames(set);
		// size = visible nodes of model
		expect(set.size).toBe(62);
	})

	test(" concept adds names of parents", () => {
		// test namespace for 'concept'
		const unit: UnitB = model.findUnit('UnitB1') as UnitB;
		const concept = unit.childrenWithName.find(child => child.name === 'B_2');
		if (!!concept) {
			const namespace = FreNamespace.create(concept);
			const set: Set<FreNamedNode> = namespace.getVisibleNodes();
			// printNames(set);
			// size = visible nodes of model
			expect(set.size).toBe(62);
		}
	})

	test(" when unit is namespace, inner names are not visible to model", () => {
		// set the type 'UnitA' to be a namespace, this hides all names of the form 'A_*_*'
		FreLanguage.getInstance().classifier('UnitA').isNamespace = true;
		// test namespace for 'model'
		const namespace = FreNamespace.create(model);
		const set: Set<FreNamedNode> = namespace.getVisibleNodes();
		// printNames(set);
		// size = 25 grandchildren plus 5 children plus 2 units
		expect(set.size).toBe(32);
		// unset namespace
		FreLanguage.getInstance().classifier('UnitA').isNamespace = false;
	})

	test(" when unit and children are namespaces, inner names are not visible to model", () => {
		// set the type 'UnitB' to be a namespace, this hides all names of the form 'B_*' and 'B_*_*'
		FreLanguage.getInstance().classifier('UnitB').isNamespace = true;
		// set the type 'NodeY' to be a namespace, this hides all names of the form 'A_*_*'.
		FreLanguage.getInstance().classifier('NodeY').isNamespace = true;
		// test namespace for 'model'
		const namespace = FreNamespace.create(model);
		const set: Set<FreNamedNode> = namespace.getVisibleNodes();
		// printNames(set);
		// size = no grandchildren plus 5 children plus 2 units
		expect(set.size).toBe(7);
		// unset namespaces
		FreLanguage.getInstance().classifier('UnitB').isNamespace = false;
		FreLanguage.getInstance().classifier('NodeY').isNamespace = false;
	})

	test(" when child of unit is namespace, inner names are not visible to unit, but names from parent are", () => {
		// set the type 'NodeX' to be a namespace
		FreLanguage.getInstance().classifier('NodeX').isNamespace = true;
		// set the type 'NodeY' to be a namespace
		FreLanguage.getInstance().classifier('NodeY').isNamespace = true;
		// test namespace for 'unit'
		const namespace = FreNamespace.create(model.findUnit('UnitA1'));
		const set: Set<FreNamedNode> = namespace.getVisibleNodes();
		// printNames(set);
		// size = no grandchildren, 5 own children, plus other unit name, plus, 5 children from other unit
		expect(set.size).toBe(12);
		// unset namespaces
		FreLanguage.getInstance().classifier('NodeX').isNamespace = false;
		FreLanguage.getInstance().classifier('NodeY').isNamespace = false;
	})

	test(" concept names from parent visible", () => {
		// set the type 'UnitA' to be a namespace, this hides all names of the form 'A_*_*' and 'A_*'
		FreLanguage.getInstance().classifier('UnitA').isNamespace = true;
		// set the type 'NodeX' to be a namespace
		FreLanguage.getInstance().classifier('NodeX').isNamespace = true;
		// test namespace for 'concept'
		const unit: UnitB = model.findUnit('UnitB1') as UnitB;
		const concept = unit.childrenWithName.find(child => child.name === 'B_2');
		if (!!concept) {
			const namespace = FreNamespace.create(concept);
			const set: Set<FreNamedNode> = namespace.getVisibleNodes();
			// printNames(set);
			// size = 5 children of 'B_2', 2 units, plus 5 direct children of UnitB1
			expect(set.size).toBe(12);
		}
		// unset namespaces
		FreLanguage.getInstance().classifier('NodeX').isNamespace = false;
	})
})
