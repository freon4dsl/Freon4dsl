import { beforeEach, describe, test, expect } from 'vitest';
import { ScoperModel } from './scoper-model/ScoperModel';
import { ModelCreator } from './ModelCreator';
import { initializeLanguage, NodeX, NodeY, UnitA, UnitB } from './scoper-model';
import { FreCompositeScoper, FreNamespace, FreScoper, FreScoperBase } from '../../scoper';
import { FreNamedNode } from '../../ast';
import { FreLanguage } from '../../language';
import { ScoperModelScoper } from './scoper-model/ScoperModelScoper';


function printNames(set: FreNamedNode[]) {
	let names: string = '';
	set.forEach(x => names += x.name + ', ');
	console.log(names);
}

function setNamespaces(names: string[]) {
	for (const name of names) {
		FreLanguage.getInstance().classifier(name).isNamespace = true;
	}
}

/**
 * Unset all possible namespaces, because we do not want to interfere with other tests
 */
function unsetNamespaces() {
	for (const name of ['UnitA', 'UnitB', 'NodeX', 'NodeY', 'IWithName']) {
		FreLanguage.getInstance().classifier(name).isNamespace = false;
	}
}

describe("FreNamespace visibleNames without replacement or additions", () => {
	let model: ScoperModel;
	let unitA1: UnitA;
	let concept_A_2: NodeY;
	let concept_A_2_2: NodeX;
	let unitB1: UnitA;
	let concept_B_4: NodeX;
	let concept_B_4_3: NodeX;

	initializeLanguage();
	const scoper: FreScoper = new ScoperModelScoper();
	const mainScoper: FreCompositeScoper = new FreCompositeScoper();
	mainScoper.appendScoper(scoper);

	beforeEach(() => {
		// create a simple model where some nodes are namespaces and some are not
		// and get some handles to nodes in the AST
		model = ModelCreator.createSimpleModel();
		unitA1 = model.findUnit('UnitA1') as UnitA;
		concept_A_2 = unitA1.childrenWithName.find(child => child.name === 'A_2') as NodeY;
		if (!!concept_A_2) {
			concept_A_2_2 = concept_A_2.childrenWithName.find(child => child.name === 'A_2_2') as NodeX;
		}
		unitB1 = model.findUnit('UnitB1') as UnitB;
		concept_B_4 = unitB1.childrenWithName.find(child => child.name === 'B_4') as NodeX;
		if (!!concept_B_4) {
			concept_B_4_3 = concept_B_4.childrenWithName.find(child => child.name === 'B_4_3') as NodeX;
		}
	});

	test(" model has all names as visible names", () => {
		// test namespace for 'model'
		const namespace = FreNamespace.create(model);

		const set: FreNamedNode[] = scoper.getVisibleNodes(model);
		// // printNames(set);;
		// visible should be: 50 grandchildren plus 10 children plus 2 units
		expect(set.length).toBe(62);
	})

	test(" unit adds names of parent", () => {
		// test namespace for 'unit'
		const unit = model.findUnit('UnitA1');
		const set: FreNamedNode[] = scoper.getVisibleNodes(unit);
		// // printNames(set);;
		// visible should be: visible nodes of model
		expect(set.length).toBe(62);
	})

	test(" concept adds names of parents", () => {
		// test namespace for 'concept'
		const unit: UnitB = model.findUnit('UnitB1') as UnitB;
		const concept = unit.childrenWithName.find(child => child.name === 'B_2');
		if (!!concept) {
			const set: FreNamedNode[] = scoper.getVisibleNodes(concept);
			// // printNames(set);;
			// visible should be: visible nodes of model
			expect(set.length).toBe(62);
		}
	})

	test(" when unit is namespace, inner names are not visible to model", () => {
		// set the type 'UnitA' to be a namespace, this hides all names of the form 'A_*_*'
		FreLanguage.getInstance().classifier('UnitA').isNamespace = true;
		// test namespace for 'model'
		const set: FreNamedNode[] = scoper.getVisibleNodes(model);
		// // printNames(set);;
		// visible should be: 25 grandchildren plus 5 children plus 2 units
		expect(set.length).toBe(32);
		// unset namespace
		FreLanguage.getInstance().classifier('UnitA').isNamespace = false;
	})

	test(" when unit and children are namespaces, inner names are not visible to model", () => {
		// set the type 'UnitB' to be a namespace, this hides all names of the form 'B_*' and 'B_*_*'
		FreLanguage.getInstance().classifier('UnitB').isNamespace = true;
		// set the type 'NodeY' to be a namespace, this hides all names of the form 'A_*_*'.
		FreLanguage.getInstance().classifier('NodeY').isNamespace = true;
		// test namespace for 'model'
		const set: FreNamedNode[] = scoper.getVisibleNodes(model);
		// // printNames(set);;
		// visible should be: no grandchildren plus 5 children plus 2 units
		expect(set.length).toBe(7);
		// unset namespaces, do not interfere with other tests
		FreLanguage.getInstance().classifier('UnitB').isNamespace = false;
		FreLanguage.getInstance().classifier('NodeY').isNamespace = false;
	})

	test(" when child of unit is namespace, inner names are not visible to unit, but names from parent are", () => {
		// set the type 'NodeX' to be a namespace
		FreLanguage.getInstance().classifier('NodeX').isNamespace = true;
		// set the type 'NodeY' to be a namespace
		FreLanguage.getInstance().classifier('NodeY').isNamespace = true;
		// test namespace for 'unit'
		const set: FreNamedNode[] = scoper.getVisibleNodes(model.findUnit('UnitA1'));
		// // printNames(set);;
		// visible should be: no grandchildren, 5 own children, plus other unit name, plus, 5 children from other unit
		expect(set.length).toBe(12);
		// unset namespaces, do not interfere with other tests
		FreLanguage.getInstance().classifier('NodeX').isNamespace = false;
		FreLanguage.getInstance().classifier('NodeY').isNamespace = false;
	})

	test(" A_2_2 with []", () => {
		// test namespace for 'A_2_2'
		if (!!concept_A_2_2) {
			// setNamespaces([]);
			const set: FreNamedNode[] = scoper.getVisibleNodes(concept_A_2_2);
			// // printNames(set);;
			// visible should be: whole  AST
			expect(set.length).toBe(62);
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
		}
	})

	test(" A_2_2 with [NodeX]", () => {
		// test namespace for 'A_2_2'
		if (!!concept_A_2_2) {
			setNamespaces(['NodeX']);
			const set: FreNamedNode[] = scoper.getVisibleNodes(concept_A_2_2);
			// // printNames(set);;
			// visible should be: [UnitA1, UnitB1,
			// 		A_0, A_1, A_2, A_3, A_4,
			// 		A_0_0, A_0_1, A_0_2, A_0_3, A_0_4,
			// 		A_1_0, A_1_1, A_1_2, A_1_3, A_1_4,
			// 		A_2_0, A_2_1, A_2_2, A_2_3, A_2_4,
			// 		A_3_0, A_3_1, A_3_2, A_3_3, A_3_4,
			// 		A_4_0, A_4_1, A_4_2, A_4_3, A_4_4,
			// 		B_0, B_1, B_2, B_3, B_4]
			expect(set.length).toBe(37);
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
		}
	})

	test(" A_2_2 with [NodeX, UnitB]", () => {
		// test namespace for 'A_2_2'
		if (!!concept_A_2_2) {
			setNamespaces(['NodeX', 'UnitB']);
			const set: FreNamedNode[] = scoper.getVisibleNodes(concept_A_2_2);
			// // printNames(set);;
			// visible should be: [UnitA1, UnitB1,
			// 	A_0, A_1, A_2, A_3, A_4,
			// 	A_0_0, A_0_1, A_0_2, A_0_3, A_0_4,
			// 	A_1_0, A_1_1, A_1_2, A_1_3, A_1_4,
			// 	A_2_0, A_2_1, A_2_2, A_2_3, A_2_4,
			// 	A_3_0, A_3_1, A_3_2, A_3_3, A_3_4,
			// 	A_4_0, A_4_1, A_4_2, A_4_3, A_4_4]
			expect(set.length).toBe(32);
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
		}
	})

	test(" A_2_2 with [NodeX, UnitA]", () => {
		// test namespace for 'A_2_2'
		if (!!concept_A_2_2) {
			setNamespaces(['NodeX', 'UnitA']);
			const set: FreNamedNode[] = scoper.getVisibleNodes(concept_A_2_2);
			// printNames(set);;
			// visible should be: [UnitA1, UnitB1,
			// 		A_0, A_1, A_2, A_3, A_4,
			// 		A_0_0, A_0_1, A_0_2, A_0_3, A_0_4,
			// 		A_1_0, A_1_1, A_1_2, A_1_3, A_1_4,
			// 		A_2_0, A_2_1, A_2_2, A_2_3, A_2_4,
			// 		A_3_0, A_3_1, A_3_2, A_3_3, A_3_4,
			// 		A_4_0, A_4_1, A_4_2, A_4_3, A_4_4,
			// 		B_0, B_1, B_2, B_3, B_4]
			expect(set.length).toBe(37);
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
		}
	})

	test(" A_2_2 with [NodeX, UnitA, UnitB]", () => {
		// test namespace for 'A_2_2'
		if (!!concept_A_2_2) {
			setNamespaces(['NodeY', 'UnitA', 'UnitB']);
			const set: FreNamedNode[] = scoper.getVisibleNodes(concept_A_2_2);
			// printNames(set);;
			// visible should be: [A_2_0, A_2_1, A_2_2, A_2_3, A_2_4,
			// 	A_0, A_1, A_2, A_3, A_4,
			// 	UnitA1, UnitB1]
			expect(set.length).toBe(12);
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
		}
	})

	test(" A_2_2 with [NodeY]", () => {
		// test namespace for 'A_2_2'
		if (!!concept_A_2_2) {
			setNamespaces(['NodeY']);
			const set: FreNamedNode[] = scoper.getVisibleNodes(concept_A_2_2);
			// printNames(set);;
			// visible should be: [A_2_0, A_2_1, A_2_2, A_2_3, A_2_4,
			// 	UnitA1, UnitB1,
			// 	A_0, A_1, A_2, A_3, A_4,
			// 	B_0, B_1, B_2, B_3, B_4,
			// 	B_0_0, B_0_1, B_0_2, B_0_3, B_0_4,
			// 	B_1_0, B_1_1, B_1_2, B_1_3, B_1_4,
			// 	B_2_0, B_2_1, B_2_2, B_2_3, B_2_4,
			// 	B_3_0, B_3_1, B_3_2, B_3_3, B_3_4,
			// 	B_4_0, B_4_1, B_4_2, B_4_3, B_4_4]
			expect(set.length).toBe(42);
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
		}
	})

	test(" A_2_2 with [NodeY, UnitA]", () => {
		// test namespace for 'A_2_2'
		if (!!concept_A_2_2) {
			setNamespaces(['NodeY', 'UnitA']);
			const set: FreNamedNode[] = scoper.getVisibleNodes(concept_A_2_2);
			// printNames(set);;
			// visible should be: [A_2_0, A_2_1, A_2_2, A_2_3, A_2_4,
			// 	A_0, A_1, A_2, A_3, A_4,
			// 	UnitA1, UnitB1,
			// 	B_0, B_1, B_2, B_3, B_4,
			// 	B_0_0, B_0_1, B_0_2, B_0_3, B_0_4,
			// 	B_1_0, B_1_1, B_1_2, B_1_3, B_1_4,
			// 	B_2_0, B_2_1, B_2_2, B_2_3, B_2_4,
			// 	B_3_0, B_3_1, B_3_2, B_3_3, B_3_4,
			// 	B_4_0, B_4_1, B_4_2, B_4_3, B_4_4]
			expect(set.length).toBe(42);
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
		}
	})

	test(" A_2_2 with [NodeY, UnitB]", () => {
		// test namespace for 'A_2_2'
		if (!!concept_A_2_2) {
			setNamespaces(['NodeY', 'UnitB']);
			const set: FreNamedNode[] = scoper.getVisibleNodes(concept_A_2_2);
			// printNames(set);;
			// visible should be: [A_2_0, A_2_1, A_2_2, A_2_3, A_2_4, A_0, A_1, A_2, A_3, A_4, UnitA1, UnitB1]
			expect(set.length).toBe(12);
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
		}
	})

	test(" A_2_2 with [NodeY, UnitA, UnitB]", () => {
		// test namespace for 'A_2_2'
		if (!!concept_A_2_2) {
			setNamespaces(['NodeY', 'UnitA', 'UnitB']);
			const set: FreNamedNode[] = scoper.getVisibleNodes(concept_A_2_2);
			// printNames(set);;
			// visible should be: [A_0, A_1, A_2, A_3, A_4, A_2_1, A_2_2, UnitA1, UnitB1]
			expect(set.length).toBe(12);
			unsetNamespaces();
		}
	})

	test(" A_2_2 with [NodeX, NodeY, UnitA, UnitB]", () => {
		// test namespace for 'A_2_2'
		if (!!concept_A_2_2) {
			setNamespaces(['NodeX', 'NodeY', 'UnitA', 'UnitB']);
			const set: FreNamedNode[] = scoper.getVisibleNodes(concept_A_2_2);
			// printNames(set);;
			// visible should be: [A_2_0, A_2_1, A_2_2, A_2_3, A_2_4, A_0, A_1, A_2, A_3, A_4, UnitA1, UnitB1]
			expect(set.length).toBe(12);
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
		}
	})
})
